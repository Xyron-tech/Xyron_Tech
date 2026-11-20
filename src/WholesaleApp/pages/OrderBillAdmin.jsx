import {useEffect,useState} from "react";
import {Link,useParams} from "react-router-dom";
import {ArrowLeft,CheckCircle2,FileText,Send,Store} from "lucide-react";
import BrandLoader from "../../Components/BrandLoader";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const weight=value=>value>=1000?`${Number((value/1000).toFixed(2))} kg`:`${value} g`;
const normalizeLocation=value=>String(value||"").trim().normalize("NFKC").replace(/[.,]/g,"").toLocaleUpperCase("en-IN");
function matchingRegionId(order,business){
  const regions=business?.deliveryRegions||[];
  const pincode=String(order.deliveryPincode||"").trim();
  const pincodeRegion=regions.find(region=>region.matchType==="PINCODE"&&region.pincode===pincode);
  if(pincodeRegion)return String(pincodeRegion._id);
  const district=normalizeLocation(order.deliveryDistrict);
  const state=normalizeLocation(order.deliveryState);
  const districtRegion=regions.find(region=>region.matchType==="DISTRICT"&&normalizeLocation(region.district)===district&&normalizeLocation(region.state)===state);
  if(districtRegion)return String(districtRegion._id);
  const stateRegion=regions.find(region=>region.matchType==="STATE"&&normalizeLocation(region.state)===state);
  return stateRegion?String(stateRegion._id):"";
}

export default function OrderBillAdmin(){
  const {orderId}=useParams();
  const [order,setOrder]=useState(null),[business,setBusiness]=useState(null),[regionId,setRegionId]=useState(""),[deliveryChargePaisa,setDeliveryChargePaisa]=useState(null),[newStateRate,setNewStateRate]=useState(""),[billDescription,setBillDescription]=useState(""),[loading,setLoading]=useState(true),[sending,setSending]=useState(false),[error,setError]=useState("");

  useEffect(()=>{
    let active=true;
    Promise.all([api.get(`/business/orders/${encodeURIComponent(orderId)}`),api.get("/business/storefront")])
      .then(([orderResponse,businessResponse])=>{
        if(!active)return;
        const nextOrder=orderResponse.data.order,nextBusiness=businessResponse.data.business;
        setOrder(nextOrder);
        setBusiness(nextBusiness);
        setRegionId(matchingRegionId(nextOrder,nextBusiness));
        setNewStateRate("");
        setDeliveryChargePaisa(null);
        setBillDescription("");
        setError("");
      })
      .catch(error=>{if(active)setError(getApiError(error));})
      .finally(()=>{if(active)setLoading(false);});
    return ()=>{active=false;};
  },[orderId]);

  const weightGrams=order?.totalWeightGrams??order?.totalWeightG??0;
  const selectedRegion=business?.deliveryRegions?.find(region=>String(region._id)===regionId);
  const calculatedCharge=selectedRegion?Math.round(Number(selectedRegion.ratePerKgPaisa)*weightGrams/1000):0;
  const parsedNewStateRate=Number(newStateRate);
  const newStateRatePaisa=newStateRate.trim()===""||!Number.isFinite(parsedNewStateRate)?null:Math.round(parsedNewStateRate*100);
  const calculatedNewStateCharge=newStateRatePaisa===null?null:Math.round(newStateRatePaisa*weightGrams/1000);
  const needsNewStateRate=Boolean(order?.deliveryFeePending&&!regionId&&order.deliveryState);
  const paymentMethod=business?.paymentMethod||(business?.paymentQrEnabled===false?"OFF":business?.paymentQrUrl?"QR":business?.upiId?"GPAY":"QR");
  const paymentSetupMissing=(paymentMethod==="QR"&&!business?.paymentQrUrl)||(paymentMethod==="GPAY"&&!business?.upiId?.trim());

  function chooseRegion(value){
    setRegionId(value);
    const region=business?.deliveryRegions?.find(item=>String(item._id)===value);
    setDeliveryChargePaisa(region?Math.round(Number(region.ratePerKgPaisa)*weightGrams/1000):0);
  }

  async function sendFinalBill(event){
    event.preventDefault();
    if(!order)return;
    if(needsNewStateRate&&(newStateRatePaisa===null||!Number.isSafeInteger(newStateRatePaisa)||newStateRatePaisa<0||newStateRatePaisa>100000000)){
      setError("Enter a valid delivery rate per kilogram for this state.");
      return;
    }
    if(!needsNewStateRate&&!regionId)return;
    setSending(true);
    setError("");
    try{
      const billDetails=needsNewStateRate
        ?{newStateRatePerKgPaisa:newStateRatePaisa,billDescription}
        :{regionId,deliveryChargePaisa:Number(deliveryChargePaisa??calculatedCharge),billDescription};
      const {data}=await api.post(`/business/orders/${order._id}/bill`,billDetails);
      setOrder(data.order);
      notify("Final bill sent to the customer.");
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setSending(false);}
  }

  if(loading)return <BrandLoader label="Loading order bill"/>;
  if(!order)return <section className="order-bill-page"><div className="panel order-bill-error"><FileText size={28}/><h1>Bill unavailable</h1><p>{error||"This order could not be found in your store."}</p><Link className="wholesale-back-link" to="/dashboard/orders"><ArrowLeft size={15}/> Back to orders</Link></div></section>;

  const bill=order.billSnapshot;
  const items=bill?.items||order.items;
  const subtotalPaisa=bill?.productSubtotalPaisa??Math.round(Number(order.subtotalInr)*100);
  const finalTotal=bill?.totalPaisa;
  return <section className="order-bill-page">
    <header className="order-bill-page-heading"><div><Link className="wholesale-back-link" to="/dashboard/orders"><ArrowLeft size={15}/> Back to orders</Link><span className="admin-section-kicker">PRODUCT BILL</span><h1>{order.orderNumber}</h1><p>{order.customerName} · {order.status}</p></div><span className={`order-status ${order.status.toLowerCase()}`}>{order.status}</span></header>
    <article className="order-bill-sheet panel">
      <header className="order-bill-sheet-heading"><div><span className="order-bill-sheet-icon"><Store size={20}/></span><div><small>ORDER BILL</small><h2>{business?.name||"Your store"}</h2></div></div><span>{new Date(order.createdAt).toLocaleDateString()}</span></header>
      <div className="order-bill-customer-line"><b>{order.customerName}</b><span>{[order.deliveryDistrict,order.deliveryState].filter(Boolean).join(", ")}{order.deliveryPincode?` · PIN ${order.deliveryPincode}`:""}</span><span>{order.orderNumber}</span></div>
      <div className="order-bill-weight-line"><span>Actual product weight</span><b>{weight(weightGrams)}</b></div>
      <div className="order-bill-product-lines">{items.map((item,index)=><article key={`${item.productId||item.name}-${index}`}><div><b>{item.name}</b><small>{item.packetQuantity} {item.unitLabel||"unit"}{item.packetQuantity===1?"":"s"} × {money.format(item.packetPrice)}</small></div><strong>{money.format(item.lineTotal)}</strong></article>)}</div>
      <div className="order-bill-summary">
        <div><span>Products subtotal</span><b>{money.format(subtotalPaisa/100)}</b></div>
        {bill?<div><span>Delivery · {bill.region.name}</span><b>{money.format(bill.deliveryChargePaisa/100)}</b></div>:order.deliveryFeePending?<div className="order-bill-pending"><span>Delivery charge</span><b>Pending rate</b></div>:null}
        {bill?<strong><span>Order total</span><b>{money.format(finalTotal/100)}</b></strong>:<strong><span>{order.deliveryFeePending?"Products subtotal":"Products total"}</span><b>{money.format(subtotalPaisa/100)}</b></strong>}
      </div>
      {order.status==="ACCEPTED"&&!bill&&<section className="order-bill-compose">
        <header><CheckCircle2 size={17}/><div><b>{needsNewStateRate?`Set delivery rate for ${order.deliveryState}`:"Complete this customer bill"}</b><small>{needsNewStateRate?"The state rate is saved in Shipping and applied to this order’s actual weight.":"Select the saved location rate. Delivery is calculated from this order’s actual weight."}</small></div></header>
        {needsNewStateRate||business?.deliveryRegions?.length?<form onSubmit={sendFinalBill}>
          {needsNewStateRate?<>
            <label>Delivery rate for {order.deliveryState} (₹ per kg)<input required type="number" min="0" max="1000000" step="0.01" value={newStateRate} onChange={event=>setNewStateRate(event.target.value)} placeholder="Enter rate per kg"/></label>
            <p className="order-bill-state-rate-hint">{calculatedNewStateCharge===null?"Enter the rate per kg to calculate this order’s delivery charge.":`This order’s delivery charge: ${money.format(calculatedNewStateCharge/100)} (${weight(weightGrams)} × ${money.format(newStateRatePaisa/100)}/kg). The state rate will be saved for future orders.`}</p>
          </>:<>
            <label>Delivery region<select required value={regionId} onChange={event=>chooseRegion(event.target.value)}><option value="">Choose a saved region</option>{business.deliveryRegions.map(region=><option key={region._id} value={region._id}>{region.name} · {money.format(Number(region.ratePerKgPaisa)/100)}/kg</option>)}</select></label>
            <label>Delivery charge (₹)<input type="number" min="0" max="1000000" step="0.01" value={(Number(deliveryChargePaisa??calculatedCharge)/100).toFixed(2)} onChange={event=>setDeliveryChargePaisa(Math.round(Number(event.target.value)*100))}/></label>
          </>}
          <label>Bill note · optional<textarea maxLength="500" rows="3" value={billDescription} onChange={event=>setBillDescription(event.target.value)} placeholder="Add an optional delivery or payment note."/></label>
          {paymentSetupMissing&&<p className="order-bill-warning">{paymentMethod==="GPAY"?"Add a GPay number or UPI ID in Payment settings before sending the bill.":"Add a customer payment QR in Payment settings before sending the bill."}</p>}
          <button className="primary" type="submit" disabled={sending||(needsNewStateRate?newStateRatePaisa===null:!regionId)||paymentSetupMissing}><Send size={15}/>{sending?"Sending bill…":"Save rate & send final bill"}</button>
        </form>:<p className="order-bill-warning">{order.deliveryFeePending?"This order has no delivery state. Add a location rate in ":"Add a location rate in "}<Link to="/dashboard/shipping">Shipping settings</Link> before finishing the bill.</p>}
      </section>}
      {!bill&&order.deliveryFeePending&&<p className="order-bill-pending-note">The order is already placed. Once you save the delivery rate and send the final bill, the customer will see the confirmed amount in Orders.</p>}
    </article>
  </section>;
}
