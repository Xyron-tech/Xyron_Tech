import {useEffect,useState} from "react";
import {Link,useLocation} from "react-router-dom";
import {BarChart3,ClipboardList,LogOut,MessageCircle,Search,Send,ShieldCheck,Store,UserRound} from "lucide-react";
import {useAuth} from "../context/useAuth";
import {api} from "../lib/api";

export default function MobileBottomNav({inboxCounts={pendingOrders:0,unreadConversations:0}}){
  const {user,logout}=useAuth();
  const {pathname,hash,search}=useLocation();
  const activeClass=condition=>condition?"active":"";
  const storeMatch=pathname.match(/^\/store\/([^/]+)/);
  const storeSlug=storeMatch?decodeURIComponent(storeMatch[1]):"";
  const [unreadCustomerMessages,setUnreadCustomerMessages]=useState(0);
  useEffect(()=>{
    if(!storeSlug)return undefined;
    let active=true;
    const load=async()=>{
      try{
        const {data}=await api.get(`/stores/${encodeURIComponent(storeSlug)}/customer/inbox-counts`);
        if(active)setUnreadCustomerMessages(data.unreadOrderMessages||0);
      }catch(error){
        if(!active)return;
        if(error?.response?.status===401)setUnreadCustomerMessages(0);
        else console.error("Could not load unread customer order messages.",error);
      }
    };
    load();
    const timer=window.setInterval(load,15000);
    window.addEventListener("focus",load);
    window.addEventListener("xyron:order-chat-read",load);
    return ()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",load);window.removeEventListener("xyron:order-chat-read",load);};
  },[storeSlug]);
  if(storeMatch){
    const slug=decodeURIComponent(storeMatch[1]);
    const storePath=`/store/${encodeURIComponent(slug)}`;
    const account=`/store/${encodeURIComponent(slug)}/account`;
    const orders=`/store/${encodeURIComponent(slug)}/orders`;
    const isOrdersPage=pathname===orders||pathname.startsWith(`${orders}/`);
    return <nav className="mobile-bottom-nav" aria-label="Customer navigation">
      <Link className={activeClass(pathname===storePath)} aria-current={pathname===storePath?"page":undefined} to={`${storePath}#products`}><Store/><span>Shop</span></Link>
      <Link className={`nav-with-count ${activeClass(isOrdersPage)}`} aria-current={isOrdersPage?"page":undefined} to={orders} aria-label={`Orders${unreadCustomerMessages?`, ${unreadCustomerMessages} unread chat messages`:""}`}><ClipboardList/><span>Orders</span>{unreadCustomerMessages>0&&<b className="nav-chat-count-badge" aria-hidden="true">{unreadCustomerMessages>99?"99+":unreadCustomerMessages}</b>}</Link>
      <Link className={activeClass(pathname===storePath&&search.includes("focusSearch"))} aria-current={pathname===storePath&&search.includes("focusSearch")?"page":undefined} to={`${storePath}?focusSearch=1#products`} aria-label="Search products"><Search/><span>Search</span></Link>
      {user?.role==="BUSINESS_OWNER"
        ?<Link className={activeClass(false)} to="/dashboard/products" aria-label="Return to business dashboard"><Store/><span>Dashboard</span></Link>
        :<Link className={activeClass(pathname===account)} aria-current={pathname===account?"page":undefined} to={account}><UserRound/><span>Profile</span></Link>}
    </nav>;
  }
  if(user?.role==="BUSINESS_OWNER"){
    return <nav className="mobile-bottom-nav" aria-label="Business navigation">
      <Link className={activeClass(pathname==="/dashboard"||pathname==="/dashboard/products")} aria-current={pathname==="/dashboard"||pathname==="/dashboard/products"?"page":undefined} to="/dashboard/products"><Store/><span>Products</span></Link>
      <Link className={`nav-with-count ${activeClass(pathname==="/dashboard/orders")}`} aria-current={pathname==="/dashboard/orders"?"page":undefined} to="/dashboard/orders" aria-label={`Orders${inboxCounts.pendingOrders?`, ${inboxCounts.pendingOrders} pending`:""}${inboxCounts.unreadOrderMessages?`, ${inboxCounts.unreadOrderMessages} unread chat messages`:""}`}><ClipboardList/><span>Orders</span>{inboxCounts.pendingOrders>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.pendingOrders>99?"99+":inboxCounts.pendingOrders}</b>}{inboxCounts.unreadOrderMessages>0&&<b className="nav-chat-count-badge" aria-hidden="true">{inboxCounts.unreadOrderMessages>99?"99+":inboxCounts.unreadOrderMessages}</b>}</Link>
      <Link className={activeClass(pathname==="/dashboard/analytics")} aria-current={pathname==="/dashboard/analytics"?"page":undefined} to="/dashboard/analytics"><BarChart3/><span>Analytics</span></Link>
      <Link className={`nav-with-count ${activeClass(pathname==="/dashboard/support")}`} aria-current={pathname==="/dashboard/support"?"page":undefined} to="/dashboard/support" aria-label={`Support inbox${inboxCounts.unreadConversations?`, ${inboxCounts.unreadConversations} unread conversations`:""}`}><MessageCircle/><span>Inbox</span>{inboxCounts.unreadConversations>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.unreadConversations>99?"99+":inboxCounts.unreadConversations}</b>}</Link>
      <Link className={activeClass(pathname==="/dashboard/profile"||(pathname==="/dashboard"&&hash==="#profile"))} aria-current={pathname==="/dashboard/profile"||(pathname==="/dashboard"&&hash==="#profile")?"page":undefined} to="/dashboard/profile"><UserRound/><span>Profile</span></Link>
      <button type="button" onClick={()=>logout()}><LogOut/><span>Sign out</span></button>
    </nav>;
  }
  if(user?.role==="SUPER_ADMIN"){
    return <nav className="mobile-bottom-nav" aria-label="Platform navigation">
      <Link className={activeClass(pathname==="/super-admin/applications")} aria-current={pathname==="/super-admin/applications"?"page":undefined} to="/super-admin/applications"><ShieldCheck/><span>Apps</span></Link>
      <Link className={`nav-with-count ${activeClass(pathname==="/super-admin/support"&&hash!=="#broadcast")}`} aria-current={pathname==="/super-admin/support"&&hash!=="#broadcast"?"page":undefined} to="/super-admin/support" aria-label={`Inbox${inboxCounts.unreadConversations?`, ${inboxCounts.unreadConversations} unread conversations`:""}`}><MessageCircle/><span>Inbox</span>{inboxCounts.unreadConversations>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.unreadConversations>99?"99+":inboxCounts.unreadConversations}</b>}</Link>
      <Link className={activeClass(pathname==="/super-admin/support"&&hash==="#broadcast")} aria-current={pathname==="/super-admin/support"&&hash==="#broadcast"?"page":undefined} to="/super-admin/support#broadcast"><Send/><span>Broadcast</span></Link>
      <button type="button" onClick={()=>logout()}><LogOut/><span>Sign out</span></button>
    </nav>;
  }
  return null;
}
