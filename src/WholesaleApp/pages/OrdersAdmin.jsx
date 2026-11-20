import {useCallback,useEffect,useState} from "react";
import {Archive,FileText,MapPin,MessageCircle,Phone,RefreshCw,ThumbsDown} from "lucide-react";
import {Link,useOutletContext} from "react-router-dom";
import {api,getApiError} from "../lib/api";
import {notify} from "../lib/notifications";
import BrandLoader from "../../Components/BrandLoader";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const normalizedLocation=value=>String(value||"").trim().normalize("NFKC").replace(/[.,]/g,"").toLocaleUpperCase("en-IN");
const formatOrderWeight=grams=>Number(grams)>=1000?`${Number((Number(grams)/1000).toFixed(2))} kg`:`${Math.ceil(Number(grams)||0)} g`;
function internationalPhone(phone){
  const digits=String(phone||"").replace(/\D/g,"");
  if(digits.length===10)return `91${digits}`;
  if(digits.length===11&&digits.startsWith("0"))return `91${digits.slice(1)}`;
  return digits;
}

export default function OrdersAdmin(){
  const {business}=useOutletContext();
  const [orders,setOrders]=useState([]),[statusFilter,setStatusFilter]=useState("ALL"),[showArchived,setShowArchived]=useState(false),[loading,setLoading]=useState(true),[error,setError]=useState("");
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

  const visibleOrders=orders.filter(order=>{
    const isHistory=Boolean(order.businessArchivedAt)||!["PLACED","ACCEPTED"].includes(order.status);
    return showArchived?isHistory:!isHistory;
  });
  const pendingDeliveryOrders=visibleOrders.filter(order=>order.deliveryFeePending);
  const sortedOrders=[...visibleOrders].sort((first,second)=>new Date(second.createdAt)-new Date(first.createdAt));
  const matchesFilter=(order,value)=>value==="ALL"||(value==="PROCESSING"?["PLACED","ACCEPTED"].includes(order.status):order.status===value);
  const filteredOrders=sortedOrders.filter(order=>matchesFilter(order,statusFilter));
  const statusFilters=showArchived?[["ALL","All"],["REJECTED","Rejected"],["CANCELLED","Cancelled"],["DELIVERED","Delivered"]]:[["ALL","All"],["PROCESSING","Processing"]];
  const groupedOrders=filteredOrders.reduce((groups,order)=>{
    const date=new Date(order.createdAt),key=`${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if(!groups[key])groups[key]={label:date.toLocaleDateString(undefined,{weekday:"long",year:"numeric",month:"long",day:"numeric"}),orders:[]};
    groups[key].orders.push(order);
    return groups;
  },{});
  const customerNameFor=order=>order.customerName||"Customer";
  const customerPlaceFor=order=>{
    const area=[order.deliveryDistrict,order.deliveryState].filter(Boolean).join(", ");
    if(area)return area;
    const address=String(order.deliveryAddress||"").split(",").map(part=>part.trim()).filter(Boolean).slice(-2).join(", ");
    return address||(order.deliveryPincode?`PIN ${order.deliveryPincode}`:"Location not provided");
  };

  async function updateStatus(order,status){
    setError("");
    if(status==="REJECTED"&&!window.confirm(`Reject order ${order.orderNumber}? Its reserved stock will be returned.`))return;
    try{
      const {data}=await api.patch(`/business/orders/${order._id}/status`,{status});
      setOrders(current=>current.map(item=>item._id===data.order._id?data.order:item));
      notify(`Order ${data.order.orderNumber} ${status.toLowerCase()}.`);
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
  }
  async function updateArchive(order,archived){
    if(archived&&!window.confirm(`Archive order ${order.orderNumber}? You can restore it later.`))return;
    setError("");
    try{
      const {data}=await api.patch(`/business/orders/${order._id}/archive`,{archived});
      notify(data.message);
      await loadOrders();
    }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
  }

  return <section className="orders-admin">
    <header className="orders-admin-heading"><div><span className="eyebrow"><i/> BUSINESS WORKSPACE</span><h1>Orders</h1><p>New orders enter processing automatically. Open a product bill from any order row.</p></div><div className="orders-heading-actions"><button type="button" className="refresh-orders" onClick={loadOrders}><RefreshCw size={15}/> Refresh</button></div></header>
    {error&&<div className="error">{error}</div>}
    {loading?<BrandLoader label="Loading orders"/>:<div className="orders-admin-layout">
      <div className="orders-list panel">
        {!showArchived&&pendingDeliveryOrders.length>0&&<div className="pending-delivery-orders-alert" role="status"><MapPin size={19}/><div><b>{pendingDeliveryOrders.length} order{pendingDeliveryOrders.length===1?"":"s"} need{pendingDeliveryOrders.length===1?"s":""} a delivery rate</b><span>Open an order to check its product cost and weight. Saving a new state rate also updates Shipping and sends the customer a final bill.</span></div></div>}
        <div className="owner-products-head"><div><span className="admin-section-kicker">{showArchived?"ORDER HISTORY":"CURRENT CUSTOMER ORDERS"}</span><h2>{showArchived?"Order history":"Current orders"}</h2></div><button type="button" className="orders-archive-toggle" onClick={()=>{setStatusFilter("ALL");setShowArchived(value=>!value);}}><Archive size={14}/>{showArchived?"Show current orders":"Show history"}</button></div>
        <div className="order-status-filters" aria-label="Filter orders">{statusFilters.map(([value,label])=><button type="button" key={value} className={statusFilter===value?"active":""} onClick={()=>setStatusFilter(value)}>{label} <b>{visibleOrders.filter(order=>matchesFilter(order,value)).length}</b></button>)}</div>
        {filteredOrders.length?<><div className="order-list-columns" aria-hidden="true"><span>Customer & contact</span><span>Order</span><span>Status & total</span><span>Bill & actions</span></div>{Object.entries(groupedOrders).map(([key,group])=><section className="order-date-group" key={key}><h3>{group.label}</h3>{group.orders.map(order=>{
          const phone=internationalPhone(order.customerPhone);
          const archived=Boolean(order.businessArchivedAt);
          const isOutsideState=Boolean(order.deliveryState&&business?.state&&normalizedLocation(order.deliveryState)!==normalizedLocation(business.state));
          return <article className={`order-list-item${order.deliveryFeePending?" has-pending-delivery":""}`} key={order._id}>
            <div className="order-list-customer"><b>{customerNameFor(order)}</b><small>{customerPlaceFor(order)}</small><div className="order-row-contact-actions">{phone&&<><a href={`tel:+${phone}`} aria-label={`Call ${customerNameFor(order)}`}><Phone size={13}/> Call</a><a href={`https://wa.me/${phone}?text=${encodeURIComponent(`Hi ${customerNameFor(order)}, regarding your Xyron order ${order.orderNumber}.`)}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${customerNameFor(order)}`}><MessageCircle size={13}/> WhatsApp</a></>}</div></div>
            <div className="order-list-number"><b>{order.orderNumber}</b><small>{new Date(order.createdAt).toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"})}</small></div>
            <div className="order-list-meta"><span className={`order-status ${["PLACED","ACCEPTED"].includes(order.status)?"accepted":order.status.toLowerCase()}`}>{["PLACED","ACCEPTED"].includes(order.status)?"PROCESSING":order.status}</span><strong>{order.deliveryFeePending?`Products · ${money.format(order.subtotalInr)}`:money.format(order.billSnapshot?.totalPaisa!=null?order.billSnapshot.totalPaisa/100:order.subtotalInr)}</strong>{order.deliveryFeePending?<><small className="order-delivery-weight">{formatOrderWeight(order.totalWeightGrams??order.totalWeightG)} total weight</small><small className="order-delivery-rate-alert">{isOutsideState?`Other-state order · ${order.deliveryState}`:"Delivery rate needed"} · update required</small></>:order.billSnapshot&&<small>Delivery total calculated</small>}</div>
            <div className="order-list-actions">
              <Link className={`order-list-action${order.deliveryFeePending?" order-list-rate-update":""}`} title={order.deliveryFeePending?"Set delivery rate and notify the customer":"View product bill"} aria-label={order.deliveryFeePending?`Set delivery rate and notify ${customerNameFor(order)}`:`View ${customerNameFor(order)} product bill`} to={`/dashboard/orders/${encodeURIComponent(order._id)}/bill`}><FileText size={16}/>{order.deliveryFeePending&&<span>Update</span>}</Link>
              {!showArchived&&order.status==="PLACED"&&<button type="button" className="order-list-action order-list-decision reject" title="Reject order" aria-label={`Reject ${order.orderNumber}`} onClick={()=>updateStatus(order,"REJECTED")}><ThumbsDown size={15}/></button>}
              <button type="button" className="order-list-action order-list-archive" title={archived?"Restore order":"Archive order"} aria-label={`${archived?"Restore":"Archive"} ${order.orderNumber}`} onClick={()=>updateArchive(order,!archived)}><Archive size={15}/></button>
            </div>
          </article>;
        })}</section>)}</>:<p className="orders-filter-empty">{showArchived?"No order history yet.":statusFilter==="ALL"?"No current orders yet.":"No orders are processing."}</p>}
      </div>
    </div>}
  </section>;
}
