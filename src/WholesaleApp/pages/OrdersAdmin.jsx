import {useCallback,useEffect,useState} from "react";
import {Archive,ArrowLeft,ClipboardList,ExternalLink,FileText,MessageCircle,Pencil,Phone,RefreshCw,Send,ThumbsDown,ThumbsUp,X} from "lucide-react";
import {Link} from "react-router-dom";
import OrderChat from "../components/OrderChat";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";
import BrandLoader from "../../Components/BrandLoader";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const weight=value=>value>=1000?`${Number((value/1000).toFixed(2))} kg`:`${value} g`;
function internationalPhone(phone){
  const digits=String(phone||"").replace(/\D/g,"");
  if(digits.length===10)return `91${digits}`;
  if(digits.length===11&&digits.startsWith("0"))return `91${digits.slice(1)}`;
  return digits;
}

export default function OrdersAdmin(){
  const [orders,setOrders]=useState([]),[selectedId,setSelectedId]=useState(""),[chatOrderId,setChatOrderId]=useState(""),[orderDraftState,setOrderDraftState]=useState({key:"",proofUrl:"",editingDecision:false,billRegionId:"",billChargePaisa:0}),[reviewingPayment,setReviewingPayment]=useState(""),[statusFilter,setStatusFilter]=useState("ALL"),[showArchived,setShowArchived]=useState(false),[archiving,setArchiving]=useState(false),[quickReplies,setQuickReplies]=useState(false),[businessSettings,setBusinessSettings]=useState(null),[billDescription,setBillDescription]=useState(""),[sendingBill,setSendingBill]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const loadOrders=useCallback(async()=>{
    try{const {data}=await api.get("/business/orders",{params:{archived:String(showArchived)}});setOrders(data.orders);setError("");}
    catch(error){setError(getApiError(error));}
    finally{setLoading(false);}
  },[showArchived]);
  useEffect(()=>{
    let active=true;
    const refresh=()=>api.get("/business/orders",{params:{archived:String(showArchived)}}).then(({data})=>{
      if(active){setOrders(data.orders);setError("");setLoading(false);}
    }).catch(error=>{if(active){setError(getApiError(error));setLoading(false);}});
    refresh();
    const timer=window.setInterval(refresh,10000);
    return ()=>{active=false;window.clearInterval(timer);};
  },[showArchived]);
  useEffect(()=>{api.get("/business/storefront").then(({data})=>{setBusinessSettings(data.business);setQuickReplies(Boolean(data.business.subscriptionFeatures?.quickReplies));}).catch(error=>{setError(getApiError(error));});},[]);
  useEffect(()=>{
    const update=event=>{
      if(!event.detail)return;
      setBusinessSettings(event.detail);
      setQuickReplies(Boolean(event.detail.subscriptionFeatures?.quickReplies));
    };
    window.addEventListener("xyron:business-profile-updated",update);
    return ()=>window.removeEventListener("xyron:business-profile-updated",update);
  },[]);
  const selected=orders.find(order=>order._id===selectedId)||null;
  const defaultRegion=businessSettings?.deliveryRegions?.[0];
  const defaultBillRegionId=defaultRegion?String(defaultRegion._id):"";
  const orderWeight=selected?.totalWeightGrams??selected?.totalWeightG??0;
  const defaultBillCharge=defaultRegion?Math.round(Number(defaultRegion.ratePerKgPaisa)*orderWeight/1000):0;
  const selectionKey=`${selectedId}:${businessSettings?.updatedAt||""}:${orderWeight}`;
  const selectionDraft=orderDraftState.key===selectionKey?orderDraftState:{key:selectionKey,proofUrl:"",editingDecision:false,billRegionId:defaultBillRegionId,billChargePaisa:defaultBillCharge};
  const {proofUrl,editingDecision,billRegionId,billChargePaisa}=selectionDraft;
  function updateSelectionDraft(update){
    setOrderDraftState(current=>{
      const base=current.key===selectionKey?current:selectionDraft;
      return {...base,...update,key:selectionKey};
    });
  }
  const setProofUrl=value=>updateSelectionDraft({proofUrl:value});
  const setEditingDecision=value=>updateSelectionDraft({editingDecision:value});
  const setBillRegionId=value=>updateSelectionDraft({billRegionId:value});
  const setBillChargePaisa=value=>updateSelectionDraft({billChargePaisa:value});
  const chatOrder=orders.find(order=>order._id===chatOrderId)||null;
  const customerNameFor=order=>order.customerName||"Customer";
  const customerPlaceFor=order=>{
    const area=[order.deliveryDistrict,order.deliveryState].filter(Boolean).join(", ");
    if(area)return area;
    const address=String(order.deliveryAddress||"").split(",").map(part=>part.trim()).filter(Boolean).slice(-2).join(", ");
    return address||(order.deliveryPincode?`PIN ${order.deliveryPincode}`:"Location not provided");
  };
  const visibleOrders=orders.filter(order=>{
    const isHistory=Boolean(order.businessArchivedAt)||!["PLACED","ACCEPTED"].includes(order.status);
    return showArchived?isHistory:!isHistory;
  });
  const sortedOrders=[...visibleOrders].sort((first,second)=>
    (!showArchived?Number(second.status==="PLACED")-Number(first.status==="PLACED"):0)||
    new Date(second.createdAt)-new Date(first.createdAt)
  );
  const filteredOrders=sortedOrders.filter(order=>statusFilter==="ALL"||(statusFilter==="UNSEEN"?order.status==="PLACED":order.status===statusFilter));
  const statusFilters=showArchived?[["ALL","All"],["REJECTED","Rejected"],["CANCELLED","Cancelled"],["DELIVERED","Delivered"]]:[["ALL","All"],["UNSEEN","Unseen"],["ACCEPTED","Processing"]];
  const groupedOrders=filteredOrders.reduce((groups,order)=>{
    const date=new Date(order.createdAt),key=`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if(!groups[key])groups[key]={label:date.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"}),orders:[]};
    groups[key].orders.push(order);return groups;
  },{});
  const paymentMethod=businessSettings?.paymentMethod||(businessSettings?.paymentQrEnabled===false?"OFF":businessSettings?.paymentQrUrl?"QR":businessSettings?.upiId?"GPAY":"QR");
  const paymentSetupMissing=(paymentMethod==="QR"&&!businessSettings?.paymentQrUrl)||(paymentMethod==="GPAY"&&!businessSettings?.upiId?.trim());
  useEffect(()=>{
    if(!selectedId&&!chatOrderId)return undefined;
    const previousOverflow=document.body.style.overflow;
    const closeOnEscape=event=>{if(event.key==="Escape"){setSelectedId("");setChatOrderId("");}};
    document.body.style.overflow="hidden";
    window.addEventListener("keydown",closeOnEscape);
    return ()=>{document.body.style.overflow=previousOverflow;window.removeEventListener("keydown",closeOnEscape);};
  },[selectedId,chatOrderId]);
  async function updateStatus(status){
    setError("");
    if(status==="REJECTED"&&!window.confirm(`Reject order ${selected.orderNumber}? Its reserved stock will be returned.`))return;
    try{
      const {data}=await api.patch(`/business/orders/${selected._id}/status`,{status});
      setOrders(current=>current.map(order=>order._id===data.order._id?data.order:order));
      setEditingDecision(false);
      notify(`Order ${data.order.orderNumber} ${status.toLowerCase()}.`);
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
  }
  async function reviewPayment(status){
    if(selected?.paymentStatus!=="PROOF_SUBMITTED")return;
    setReviewingPayment(status);
    setError("");
    try{
      const {data}=await api.patch(`/business/orders/${selected._id}/payment-status`,{status});
      setOrders(current=>current.map(order=>order._id===data.order._id?data.order:order));
      notify(status==="VERIFIED"?"Payment verified.":"Payment proof rejected.");
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setReviewingPayment("");}
  }
  async function viewPaymentProof(){
    setError("");
    try{
      const {data}=await api.get(`/business/orders/${selected._id}/payment-proof`);
      setProofUrl(data.imageUrl);
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
  }
  function chooseBillRegion(regionId){
    setBillRegionId(regionId);
    const region=businessSettings?.deliveryRegions?.find(item=>String(item._id)===regionId);
    setBillChargePaisa(region?Math.round(Number(region.ratePerKgPaisa)*(selected?.totalWeightGrams??selected?.totalWeightG??0)/1000):0);
  }
  async function sendFinalBill(event){
    event.preventDefault();
    if(!selected||!billRegionId)return;
    setSendingBill(true);
    setError("");
    try{
      const {data}=await api.post(`/business/orders/${selected._id}/bill`,{regionId:billRegionId,deliveryChargePaisa:Number(billChargePaisa),billDescription});
      setOrders(current=>current.map(order=>order._id===data.order._id?data.order:order));
      notify("Final bill sent to the customer.");
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setSendingBill(false);}
  }
  async function updateArchive(archived){
    if(!selected)return;
    if(archived&&!window.confirm(`Archive order ${selected.orderNumber}? You can restore it later.`))return;
    setArchiving(true);setError("");
    try{
      const {data}=await api.patch(`/business/orders/${selected._id}/archive`,{archived});
      setSelectedId("");
      await loadOrders();
      notify(data.message);
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    finally{setArchiving(false);}
  }
  const selectedDecision=selected?.status==="PLACED"?"PLACED":["REJECTED","CANCELLED"].includes(selected?.status)?"REJECTED":"ACCEPTED";
  const selectedIsArchived=Boolean(selected?.businessArchivedAt);
  const whatsappPhone=internationalPhone(selected?.customerPhone);
  const callPhone=whatsappPhone?`+${whatsappPhone}`:"";
  return <section className="orders-admin">
    <header className="orders-admin-heading"><div><Link className="wholesale-back-link" to="/dashboard/products"><ArrowLeft size={15}/> Store management</Link><span className="eyebrow"><i/> BUSINESS WORKSPACE</span><h1>Orders</h1><p>Review and update orders placed in your store.</p></div><div className="orders-heading-actions"><button type="button" className="refresh-orders" onClick={loadOrders}><RefreshCw size={15}/> Refresh</button></div></header>
    {error&&<div className="error">{error}</div>}
    {loading?<BrandLoader label="Loading orders"/>:<div className="orders-admin-layout">
      <div className="orders-list panel">
        <div className="owner-products-head"><div><span className="admin-section-kicker">{showArchived?"ORDER HISTORY":"CURRENT CUSTOMER ORDERS"}</span><h2>{showArchived?"Order history":"Current orders"}</h2></div><button type="button" className="orders-archive-toggle" onClick={()=>{setStatusFilter("ALL");setShowArchived(value=>!value);}}><Archive size={14}/>{showArchived?"Show current orders":"Show history"}</button></div>
        <div className="order-status-filters" aria-label="Filter orders">{statusFilters.map(([value,label])=><button type="button" key={value} className={statusFilter===value?"active":""} onClick={()=>setStatusFilter(value)}>{label} <b>{visibleOrders.filter(order=>value==="ALL"||(value==="UNSEEN"?order.status==="PLACED":order.status===value)).length}</b></button>)}</div>
        {filteredOrders.length?Object.entries(groupedOrders).map(([key,group])=><section className="order-date-group" key={key}><h3>{group.label}</h3>{group.orders.map(order=><article className={`order-list-item ${selected?._id===order._id?"selected":""}`} key={order._id}>
          <div className="order-list-customer"><b>{customerNameFor(order)}</b><small>{customerPlaceFor(order)} · {new Date(order.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</small></div>
          <div className="order-list-actions"><button type="button" className="order-list-action" title="View order details" aria-label={`View ${customerNameFor(order)} order details`} onClick={()=>{setChatOrderId("");setBillDescription("");setSelectedId(order._id);}}><ClipboardList size={15}/></button><button type="button" className="order-list-action chat" title="Open customer chat" aria-label={`Chat with ${customerNameFor(order)}`} onClick={()=>{setSelectedId("");setChatOrderId(order._id);}}><MessageCircle size={15}/></button></div>
          <div className="order-list-meta"><span className={`order-status ${order.status.toLowerCase()}`}>{order.status==="PLACED"?"UNSEEN":order.status==="ACCEPTED"?"PROCESSING":order.status}</span><strong>{money.format(order.billSnapshot?.totalPaisa!=null?order.billSnapshot.totalPaisa/100:order.subtotalInr)}</strong></div>
          <small className="order-open-hint">{order.billSnapshot?"Final bill sent":"Choose order details or chat"}</small>
        </article>)}</section>):<p className="orders-filter-empty">{showArchived?"No order history yet.":statusFilter==="ALL"?"No current orders yet.":`No ${statusFilter==="UNSEEN"?"unseen":statusFilter.toLowerCase()} orders.`}</p>}
      </div>
      {selected&&<div className="order-dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setSelectedId("");}}>
        <section className="order-dialog order-details-dialog" role="dialog" aria-modal="true" aria-labelledby="order-dialog-title">
          <header className="order-dialog-heading"><div><span className="admin-section-kicker">ORDER DETAILS</span><h2 id="order-dialog-title">{customerNameFor(selected)}</h2><small>{customerPlaceFor(selected)} · Order {selected.orderNumber}</small></div><button type="button" aria-label="Close order details" onClick={()=>setSelectedId("")}><X size={20}/></button></header>
          <div className="order-dialog-content">
        <section className="panel order-admin-detail"><div className="order-detail-title"><div><span className="admin-section-kicker">ORDER DETAILS</span><h2>{customerNameFor(selected)}</h2><small>{customerPlaceFor(selected)} · Order {selected.orderNumber}</small></div><span className={`order-status ${selected.status.toLowerCase()}`}>{selected.status}</span></div>
          <div className="order-customer"><b>{selected.customerName}</b><span>{selected.customerPhone}</span><p>{selected.deliveryAddress}</p>{(selected.deliveryDistrict||selected.deliveryState)&&<p>Delivery area: <b>{[selected.deliveryDistrict,selected.deliveryState].filter(Boolean).join(", ")}</b></p>}<p>PIN {selected.deliveryPincode||"—"}</p><div className="order-contact-actions"><a href={`tel:${callPhone}`}><Phone size={14}/> Call customer</a><a href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent(`Hi ${selected.customerName}, regarding your Xyron order ${selected.orderNumber}.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={14}/> WhatsApp</a></div></div>
          {selected.items.map((item,index)=><article className="order-line" key={`${item.productId}-${index}`}><div><b>{item.name}</b><small>{item.packetQuantity} {item.unitLabel||"bundle"}{item.packetQuantity===1?"":"s"} · {weight(item.quantityWeightG)} · {money.format(item.packetPrice)} / {item.unitLabel||"unit"}</small></div><b>{money.format(item.lineTotal)}</b></article>)}
          <div className="order-totals"><span>Actual product weight <b>{weight(selected.totalWeightGrams??selected.totalWeightG)}</b></span><span>Products subtotal <b>{money.format(selected.subtotalInr)}</b></span>{selected.billSnapshot&&<span>Delivery · {selected.billSnapshot.region.name} <b>{money.format(selected.billSnapshot.deliveryChargePaisa/100)}</b></span>}<strong>{selected.billSnapshot?"Final total":"Products total"} <b>{money.format(selected.billSnapshot?selected.billSnapshot.totalPaisa/100:selected.subtotalInr)}</b></strong></div>
          {selectedDecision==="PLACED"||editingDecision?<div className="order-decision-actions"><button type="button" className="accept-order-button" disabled={selectedDecision==="ACCEPTED"} onClick={()=>updateStatus("ACCEPTED")}><ThumbsUp size={15}/> Accept</button><button type="button" className="reject-order-button" disabled={selectedDecision==="REJECTED"} onClick={()=>updateStatus("REJECTED")}><ThumbsDown size={15}/> Reject</button>{editingDecision&&<button type="button" className="cancel-decision-edit" onClick={()=>setEditingDecision(false)}><X size={14}/> Cancel edit</button>}</div>:<div className="order-decision-summary"><span>Decision: <b className={selectedDecision.toLowerCase()}>{selectedDecision}</b></span><button type="button" onClick={()=>setEditingDecision(true)}><Pencil size={14}/> Edit decision</button></div>}
          {selected.status==="ACCEPTED"&&!selected.billSnapshot&&<section className="order-bill-panel">
            <header><span><FileText size={17}/></span><div><b>Prepare the final bill</b><small>Select the matching delivery region. The price is calculated from this order’s actual weight.</small></div></header>
            {businessSettings?.deliveryRegions?.length?<form onSubmit={sendFinalBill}>
              <label>Delivery region<select required value={billRegionId} onChange={event=>chooseBillRegion(event.target.value)}><option value="">Choose a saved region</option>{businessSettings.deliveryRegions.map(region=><option key={region._id} value={region._id}>{region.name} · {money.format(Number(region.ratePerKgPaisa)/100)}/kg</option>)}</select></label>
              <div className="order-bill-weight">Actual product weight <b>{weight(selected.totalWeightGrams??selected.totalWeightG)}</b></div>
              <label>Delivery charge (₹)<input type="number" min="0" max="1000000" step="0.01" value={(Number(billChargePaisa)/100).toFixed(2)} onChange={event=>setBillChargePaisa(Number.isFinite(Number(event.target.value))?Math.round(Number(event.target.value)*100):0)}/></label>
              <label>Bill description <small>Optional</small><textarea maxLength="500" rows="3" placeholder="Add any extra note for the customer." value={billDescription} onChange={event=>setBillDescription(event.target.value)}/></label>
              <div className="order-bill-total"><span>Products {money.format(selected.subtotalInr)} + delivery {money.format(Number(billChargePaisa)/100)}</span><b>{money.format((Math.round(selected.subtotalInr*100)+Number(billChargePaisa))/100)}</b></div>
              {paymentSetupMissing&&<p className="order-bill-warning">{paymentMethod==="GPAY"?"Add a GPay number or UPI ID in Payment settings before sending this bill.":"Add a customer payment QR in Payment settings before sending this bill."}</p>}
              <button className="primary" type="submit" disabled={sendingBill||!billRegionId||paymentSetupMissing}><Send size={15}/>{sendingBill?"Sending bill…":"Send final bill"}</button>
            </form>:<div className="order-bill-warning">Add at least one delivery region in <Link to="/dashboard/shipping">Delivery settings</Link> before preparing this bill.</div>}
          </section>}
          {selected.billSnapshot&&<section className="order-bill-sent">
            <div className="order-bill-sent-heading"><FileText size={17}/><div><b>Final bill sent</b><small>{new Date(selected.billSnapshot.sentAt).toLocaleString()}</small></div></div>
            <p>{selected.billSnapshot.region.name} · {weight(selected.billSnapshot.totalWeightGrams)} × {money.format(selected.billSnapshot.region.ratePerKgPaisa/100)}/kg</p>
            <div className="order-bill-total"><span>Delivery {money.format(selected.billSnapshot.deliveryChargePaisa/100)}</span><b>Total {money.format(selected.billSnapshot.totalPaisa/100)}</b></div>
            <p className="order-payment-snapshot">{selected.billSnapshot.paymentMethodSnapshot==="GPAY"?"The GPay number and instructions are saved with this bill.":selected.billSnapshot.paymentQrSnapshot?"Payment QR and instructions are saved with this bill.":"Online payment was turned off when this bill was sent."} {selected.billSnapshot.billDescriptionSnapshot&&<>Description: {selected.billSnapshot.billDescriptionSnapshot}</>}</p>
          </section>}
          {(selected.paymentUtr||selected.paymentStatus!=="UNPAID")&&<div className="payment-review"><p>{selected.paymentUtr?<>Customer UTR: <b>{selected.paymentUtr}</b></>:"No transaction reference supplied."} · <span className={`payment-state ${selected.paymentStatus.toLowerCase()}`}>{selected.paymentStatus.replaceAll("_"," ")}</span></p><button className="secondary-button" type="button" onClick={viewPaymentProof}><ExternalLink size={14}/> View private payment proof</button>{proofUrl&&<img className="payment-proof-preview" src={proofUrl} alt="Customer payment proof"/>}{selected.paymentStatus==="PROOF_SUBMITTED"&&<div><button className="approve order-payment-verify" type="button" disabled={reviewingPayment!==""||selected.paymentStatus!=="PROOF_SUBMITTED"} onClick={()=>reviewPayment("VERIFIED")}>{reviewingPayment==="VERIFIED"?"Verifying…":"Verify payment"}</button><button className="reject" type="button" disabled={reviewingPayment!==""} onClick={()=>reviewPayment("REJECTED")}>{reviewingPayment==="REJECTED"?"Rejecting…":"Reject proof"}</button></div>}</div>}
          {selected.paymentQrSnapshot&&<p className="order-payment-snapshot">Payment QR was saved on this order. A later store QR update will not change this order.</p>}
        </section>
          </div>
          <footer className="order-dialog-footer"><button type="button" className="order-archive-button" onClick={()=>updateArchive(!selectedIsArchived)} disabled={archiving}><Archive size={14}/>{archiving?"Saving…":selectedIsArchived?"Restore order":"Archive order"}</button><button type="button" className="secondary-button" onClick={()=>setSelectedId("")}>Close</button></footer>
        </section>
      </div>}
      {chatOrder&&<div className="order-dialog-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setChatOrderId("");}}>
        <section className="order-dialog order-chat-dialog" role="dialog" aria-modal="true" aria-labelledby="order-chat-dialog-title">
          <header className="order-dialog-heading"><div><span className="admin-section-kicker">CUSTOMER CHAT</span><h2 id="order-chat-dialog-title">{customerNameFor(chatOrder)}</h2><small>{customerPlaceFor(chatOrder)} · Order {chatOrder.orderNumber}</small></div><button type="button" aria-label="Close customer chat" onClick={()=>setChatOrderId("")}><X size={20}/></button></header>
          <div className="order-chat-dialog-content"><OrderChat key={chatOrder._id} orderId={chatOrder._id} quickReplies={quickReplies}/></div>
          <footer className="order-dialog-footer"><button type="button" className="secondary-button" onClick={()=>setChatOrderId("")}>Close chat</button></footer>
        </section>
      </div>}
    </div>}
  </section>;
}
