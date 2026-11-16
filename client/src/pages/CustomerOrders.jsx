import {useEffect,useState} from "react";
import {Link,useOutletContext,useParams} from "react-router-dom";
import {ArrowLeft,ArrowRight,ClipboardList,MessageCircle,PackageCheck,Store,Trash2} from "lucide-react";
import CustomerAuthForm from "../components/CustomerAuthForm";
import CustomerStorePage from "../components/CustomerStoreChrome";
import OrderChat from "../components/OrderChat";
import {api,getApiError} from "../lib/api";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});

export default function CustomerOrders(){
  const {storeBusiness}=useOutletContext(),{slug}=useParams(),base=`/stores/${encodeURIComponent(slug)}/customer`;
  const [customer,setCustomer]=useState(null),[orders,setOrders]=useState([]),[activeChatOrder,setActiveChatOrder]=useState(""),[hasMore,setHasMore]=useState(false),[nextPage,setNextPage]=useState(2),[removingOrder,setRemovingOrder]=useState(""),[loading,setLoading]=useState(true),[loadingMore,setLoadingMore]=useState(false),[error,setError]=useState("");

  useEffect(()=>{
    let active=true;
    async function load(){
      setLoading(true);
      setCustomer(null);
      setOrders([]);
      setActiveChatOrder("");
      setHasMore(false);
      setError("");
      try{
        const {data}=await api.get(`${base}/me`);
        if(!active)return;
        setCustomer(data.customer);
        if(data.customer){
          const result=await api.get(`${base}/orders`);
          if(active){
            setOrders(result.data.orders);
            setHasMore(result.data.hasMore);
            setNextPage(2);
            setActiveChatOrder("");
          }
        }else setOrders([]);
      }catch(error){if(active)setError(getApiError(error));}
      finally{if(active)setLoading(false);}
    }
    load();
    return ()=>{active=false;};
  },[base,slug]);

  async function loadOrders(page=1){
    setError("");
    try{
      const {data}=await api.get(`${base}/orders`,{params:{page}});
      setOrders(current=>page===1?data.orders:[...current,...data.orders]);
      setHasMore(data.hasMore);
      setNextPage(page+1);
      if(page===1)setActiveChatOrder("");
    }catch(error){setError(getApiError(error));}
  }

  async function loadMore(){
    setLoadingMore(true);
    try{await loadOrders(nextPage);}
    finally{setLoadingMore(false);}
  }
  function markOrderMessagesRead(orderNumber){
    setOrders(current=>current.map(order=>order.orderNumber===orderNumber?{...order,unreadMessageCount:0,latestMessagePreview:""}:order));
  }

  async function removeOrder(orderNumber){
    if(!window.confirm(`Remove order ${orderNumber} from your history? The store will retain its order record.`))return;
    setRemovingOrder(orderNumber);setError("");
    try{
      await api.delete(`${base}/orders/${encodeURIComponent(orderNumber)}`);
      setOrders(current=>current.filter(order=>order.orderNumber!==orderNumber));
      setActiveChatOrder(current=>current===orderNumber?"":current);
      await loadOrders(1);
    }catch(error){setError(getApiError(error));}
    finally{setRemovingOrder("");}
  }

  if(loading)return <CustomerStorePage business={storeBusiness} slug={slug}><div className="store-loading"><span className="store-spinner"/>Loading your orders…</div></CustomerStorePage>;

  return <CustomerStorePage business={storeBusiness} slug={slug} isSignedIn={Boolean(customer)}><main className="customer-orders-page" id="orders">
    <header className="customer-orders-heading">
      <div><Link to={`/store/${encodeURIComponent(slug)}`}><ArrowLeft size={15}/> Back to store</Link><span className="store-eyebrow">CUSTOMER ORDERS · {slug.toUpperCase()}</span><h1>Your orders & chats</h1><p>Choose an order to view its updates or message the store in the same place.</p></div>
      {customer&&<span className="customer-orders-count">{orders.length} order{orders.length===1?"":"s"}</span>}
    </header>
    {error&&<div className="store-inline-error" role="alert">{error}</div>}
    {customer?<div className="customer-orders-layout">
      <section className="customer-orders-list panel" aria-label="Your orders">
        <div className="customer-orders-list-heading"><span><ClipboardList size={17}/> Order history</span><small>{orders.length} loaded</small></div>
        {orders.length?orders.map(order=><article className={`customer-order-row ${activeChatOrder===order.orderNumber?"selected":""} ${order.unreadMessageCount?"has-unread-message":""}`} key={order._id}>
          <div className="customer-order-row-info"><b>{order.orderNumber}</b><span>{new Date(order.createdAt).toLocaleDateString()}</span></div>
          <div className="customer-order-row-total"><b>{money.format(order.totalInr)}</b><span className={`order-status ${order.status.toLowerCase()}`}>{order.status.toLowerCase()}</span></div>
          {order.unreadMessageCount>0&&<div className="customer-order-unread"><b><MessageCircle size={13}/> New message from the store <i>{order.unreadMessageCount}</i></b><span>{order.latestMessagePreview||"Open chat to read the store update."}</span></div>}
          <div className="customer-order-row-actions">
            <button type="button" className={`customer-chat-action ${order.unreadMessageCount?"has-new-message":""}`} aria-pressed={activeChatOrder===order.orderNumber} onClick={()=>{setActiveChatOrder(order.orderNumber);markOrderMessagesRead(order.orderNumber);}}><MessageCircle size={15}/> {order.unreadMessageCount?"Read message":"Chat"}</button>
            <Link to={`/store/${encodeURIComponent(slug)}/orders/${encodeURIComponent(order.orderNumber)}`} aria-label={`View order ${order.orderNumber}`}><ArrowRight size={16}/> Details</Link>
            <button type="button" className="customer-order-delete" aria-label={`Delete order ${order.orderNumber} from your history`} disabled={Boolean(removingOrder)} onClick={()=>removeOrder(order.orderNumber)}><Trash2 size={14}/>{removingOrder===order.orderNumber?"Removing…":"Delete"}</button>
          </div>
        </article>):<div className="customer-history-empty"><PackageCheck size={24}/><b>No orders yet</b><span>Orders from this store and their chats will appear here after checkout.</span><Link to={`/store/${encodeURIComponent(slug)}#products`}><Store size={14}/> Shop this store</Link></div>}
        {hasMore&&<button className="customer-history-more" type="button" onClick={loadMore} disabled={loadingMore}>{loadingMore?"Loading orders…":"Load more orders"}</button>}
      </section>
      <aside className="customer-orders-chat">
        {activeChatOrder?<><div className="customer-orders-chat-title"><MessageCircle size={17}/><div><small>ORDER CONVERSATION</small><b>{activeChatOrder}</b></div></div><OrderChat key={activeChatOrder} customer slug={slug} orderNumber={activeChatOrder} token={window.localStorage.getItem(`xyron-order-${activeChatOrder}`)||""}/></>:<div className="customer-orders-chat-empty panel"><MessageCircle size={23}/><b>Order chat</b><span>Select an order to view its chat with the store.</span></div>}
      </aside>
    </div>:<section className="panel customer-orders-signin"><ClipboardList size={24}/><h2>Sign in to your customer account</h2><p>Your order history and order chats are private to your account.</p><CustomerAuthForm slug={slug} onAuthenticated={async account=>{setCustomer(account);await loadOrders();}}/></section>}
  </main></CustomerStorePage>;
}
