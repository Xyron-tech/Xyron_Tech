import {useEffect,useRef,useState} from "react";
import {Link,useOutletContext,useParams} from "react-router-dom";
import {ArrowLeft,ArrowRight,ClipboardList,PackageCheck,Store,Trash2} from "lucide-react";
import CustomerAuthForm from "../components/CustomerAuthForm";
import CustomerStorePage from "../components/CustomerStoreChrome";
import BrandLoader from "../../Components/BrandLoader";
import {api,getApiError} from "../lib/api";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function CustomerOrders(){
  const {storeBusiness}=useOutletContext(),{slug}=useParams(),base=`/stores/${encodeURIComponent(slug)}/customer`;
  const [customer,setCustomer]=useState(null),[orders,setOrders]=useState([]),[view,setView]=useState("current"),[hasMore,setHasMore]=useState(false),[nextPage,setNextPage]=useState(2),[removingOrder,setRemovingOrder]=useState(""),[loading,setLoading]=useState(true),[loadingMore,setLoadingMore]=useState(false),[error,setError]=useState("");
  const ordersRequestId=useRef(0);

  useEffect(()=>{
    let active=true;
    async function load(){
      const requestId=++ordersRequestId.current;
      setLoading(true);
      setCustomer(null);
      setOrders([]);
      setHasMore(false);
      setError("");
      try{
        const {data}=await api.get(`${base}/me`);
        if(!active)return;
        setCustomer(data.customer);
        if(data.customer){
          const result=await api.get(`${base}/orders`,{params:{view:"current"}});
          if(active&&requestId===ordersRequestId.current){
            setOrders(result.data.orders);
            setHasMore(result.data.hasMore);
            setNextPage(2);
            if(result.data.orders[0]?.orderNumber)window.localStorage.setItem(`xyron-last-order-${slug}`,result.data.orders[0].orderNumber);
          }
        }else if(active&&requestId===ordersRequestId.current)setOrders([]);
      }catch(error){if(active)setError(getApiError(error));}
      finally{if(active)setLoading(false);}
    }
    load();
    return ()=>{active=false;};
  },[base,slug]);
  async function loadOrders(page=1,nextView=view){
    const requestId=++ordersRequestId.current;
    setError("");
    try{
      const {data}=await api.get(`${base}/orders`,{params:{page,view:nextView}});
      if(requestId!==ordersRequestId.current)return;
      setOrders(current=>page===1?data.orders:[...current,...data.orders]);
      setHasMore(data.hasMore);
      setNextPage(page+1);
      if(page===1&&data.orders[0]?.orderNumber)window.localStorage.setItem(`xyron-last-order-${slug}`,data.orders[0].orderNumber);
    }catch(error){if(requestId===ordersRequestId.current)setError(getApiError(error));}
  }

  async function loadMore(){
    setLoadingMore(true);
    try{await loadOrders(nextPage);}
    finally{setLoadingMore(false);}
  }

  function changeView(nextView){
    if(nextView===view)return;
    setView(nextView);
    setOrders([]);
    setHasMore(false);
    loadOrders(1,nextView);
  }

  async function removeOrder(orderNumber){
    if(!window.confirm(`Remove order ${orderNumber} from your history? The store will retain its order record.`))return;
    setRemovingOrder(orderNumber);setError("");
    try{
      await api.delete(`${base}/orders/${encodeURIComponent(orderNumber)}`);
      setOrders(current=>current.filter(order=>order.orderNumber!==orderNumber));
      await loadOrders(1,view);
    }catch(error){setError(getApiError(error));}
    finally{setRemovingOrder("");}
  }

  if(loading)return <CustomerStorePage business={storeBusiness} slug={slug}><BrandLoader label="Loading your orders"/></CustomerStorePage>;

  return <CustomerStorePage business={storeBusiness} slug={slug} isSignedIn={Boolean(customer)}><main className="customer-orders-page" id="orders">
    <header className="customer-orders-heading">
      <div><Link className="wholesale-back-link" to={`/store/${encodeURIComponent(slug)}`}><ArrowLeft size={15}/> Back to store</Link><span className="store-eyebrow">CUSTOMER ORDERS · {slug.toUpperCase()}</span><h1>Your orders</h1><p>Track order status, view bills, and check new updates.</p></div>
      {customer&&<span className="customer-orders-count">{orders.length} order{orders.length===1?"":"s"}</span>}
    </header>
    {error&&<div className="store-inline-error" role="alert">{error}</div>}
    {customer?<div className="customer-orders-layout">
      <section className="customer-orders-list panel" aria-label="Your orders">
        <div className="customer-orders-view-filters" role="group" aria-label="Order view"><button type="button" className={view==="current"?"active":""} aria-pressed={view==="current"} onClick={()=>changeView("current")}>Current</button><button type="button" className={view==="history"?"active":""} aria-pressed={view==="history"} onClick={()=>changeView("history")}>History</button></div>
        <div className="customer-orders-list-heading"><span><ClipboardList size={17}/> {view==="current"?"Current orders":"Order history"}</span><small>{orders.length}{hasMore?"+":""} shown</small></div>
        {orders.length?orders.map(order=><article className="customer-order-row" key={order._id}>
          <div className="customer-order-row-info"><b>{order.customerName||customer.customerName||"Customer"}</b><span>{[order.deliveryDistrict,order.deliveryState].filter(Boolean).join(", ")||"Location not provided"}</span><small>{order.orderNumber} · {new Date(order.createdAt).toLocaleDateString()}</small>{order.billSentAt&&<span className="customer-order-bill-received">Final bill received · {new Date(order.billSentAt).toLocaleDateString()}</span>}{order.unreadUpdateCount>0&&<span className="customer-order-update-badge" aria-label={`${order.unreadUpdateCount} unread order updates`}>{order.unreadUpdateCount>99?"99+":order.unreadUpdateCount} new order update{order.unreadUpdateCount===1?"":"s"}</span>}</div>
          <div className="customer-order-row-total"><b>{order.deliveryFeePending?"Delivery pending":money.format(order.totalInr)}</b>{order.deliveryFeePending&&<small>Price to be confirmed</small>}<span className={`order-status ${order.status.toLowerCase()}`}>{order.status==="ACCEPTED"?"processing":order.status==="PLACED"?"order placed":order.status.toLowerCase()}</span></div>
          <div className="customer-order-row-actions">
            <Link to={`/store/${encodeURIComponent(slug)}/orders/${encodeURIComponent(order.orderNumber)}`} aria-label={`View order ${order.orderNumber}`}><ArrowRight size={16}/> Details</Link>
            <button type="button" className="customer-order-delete" aria-label={`Delete order ${order.orderNumber} from your history`} disabled={Boolean(removingOrder)} onClick={()=>removeOrder(order.orderNumber)}><Trash2 size={14}/>{removingOrder===order.orderNumber?"Removing…":"Delete"}</button>
          </div>
        </article>):<div className="customer-history-empty"><PackageCheck size={24}/><b>{view==="current"?"No current orders":"No order history"}</b><span>{view==="current"?"New orders and recently received bills will appear here.":"Rejected, archived, and completed orders will appear here."}</span>{view==="current"&&<Link to={`/store/${encodeURIComponent(slug)}#products`}><Store size={14}/> Shop this store</Link>}</div>}
        {hasMore&&<button className="customer-history-more" type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore?"Loading orders…":"Load more orders"}</button>}
      </section>
    </div>:<section className="panel customer-orders-signin"><ClipboardList size={24}/><h2>Sign in to your customer account</h2><p>Your order history and updates are private to your account.</p><CustomerAuthForm slug={slug} onAuthenticated={async account=>{setCustomer(account);await loadOrders();}}/></section>}
  </main></CustomerStorePage>;
}
