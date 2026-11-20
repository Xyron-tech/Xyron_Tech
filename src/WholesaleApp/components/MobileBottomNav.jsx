import {useEffect,useState} from "react";
import {Link,useLocation} from "react-router-dom";
import {BarChart3,Bell,ClipboardList,LogOut,Search,ShieldCheck,Store,UserRound} from "lucide-react";
import {useAuth} from "../context/useAuth";
import {api} from "../lib/api";

export default function MobileBottomNav({inboxCounts={pendingOrders:0,unreadAlerts:0}}){
  const {user,logout}=useAuth();
  const {pathname,search}=useLocation();
  const activeClass=condition=>condition?"active":"";
  const storeMatch=pathname.match(/^\/store\/([^/]+)/);
  const storeSlug=storeMatch?decodeURIComponent(storeMatch[1]):"";
  const [unreadOrderUpdates,setUnreadOrderUpdates]=useState(0);
  useEffect(()=>{
    if(!storeSlug)return undefined;
    let active=true;
    const load=async()=>{
      try{
        const {data}=await api.get(`/stores/${encodeURIComponent(storeSlug)}/customer/inbox-counts`);
        if(active)setUnreadOrderUpdates(data.unreadOrderUpdates||0);
      }catch(error){
        if(!active)return;
        if(error?.response?.status===401)setUnreadOrderUpdates(0);
        else console.error("Could not load unread customer order updates.",error);
      }
    };
    load();
    const timer=window.setInterval(load,15000);
    window.addEventListener("focus",load);
    window.addEventListener("xyron:customer-order-notification-read",load);
    return ()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",load);window.removeEventListener("xyron:customer-order-notification-read",load);};
  },[storeSlug]);
  if(storeMatch){
    const slug=decodeURIComponent(storeMatch[1]);
    const storePath=`/store/${encodeURIComponent(slug)}`;
    const account=`/store/${encodeURIComponent(slug)}/account`;
    const orders=`/store/${encodeURIComponent(slug)}/orders`;
    const isOrdersPage=pathname===orders||pathname.startsWith(`${orders}/`);
    return <nav className="mobile-bottom-nav" aria-label="Customer navigation">
      <Link className={activeClass(pathname===storePath)} aria-current={pathname===storePath?"page":undefined} to={`${storePath}#products`}><Store/><span>Shop</span></Link>
      <Link className={`nav-with-count ${activeClass(isOrdersPage)}`} aria-current={isOrdersPage?"page":undefined} to={orders} aria-label={`Orders${unreadOrderUpdates?`, ${unreadOrderUpdates} unread order updates`:""}`}><Bell/><span>Orders</span>{unreadOrderUpdates>0&&<b className="nav-count-badge" aria-hidden="true">{unreadOrderUpdates>99?"99+":unreadOrderUpdates}</b>}</Link>
      <Link className={activeClass(pathname===storePath&&search.includes("focusSearch"))} aria-current={pathname===storePath&&search.includes("focusSearch")?"page":undefined} to={`${storePath}?focusSearch=1#products`} aria-label="Search products"><Search/><span>Search</span></Link>
      {user?.role==="BUSINESS_OWNER"
        ?<Link className={activeClass(false)} to="/dashboard/products" aria-label="Return to business dashboard"><Store/><span>Dashboard</span></Link>
        :<Link className={activeClass(pathname===account)} aria-current={pathname===account?"page":undefined} to={account}><UserRound/><span>Profile</span></Link>}
    </nav>;
  }
  if(user?.role==="BUSINESS_OWNER"){
    return <nav className="mobile-bottom-nav" aria-label="Business navigation">
      <Link className={activeClass(pathname==="/dashboard"||pathname==="/dashboard/products")} aria-current={pathname==="/dashboard"||pathname==="/dashboard/products"?"page":undefined} to="/dashboard/products"><Store/><span>Products</span></Link>
      <Link className={`nav-with-count ${activeClass(pathname==="/dashboard/orders")}`} aria-current={pathname==="/dashboard/orders"?"page":undefined} to="/dashboard/orders" aria-label={`Orders${inboxCounts.pendingOrders?`, ${inboxCounts.pendingOrders} pending`:""}`}><ClipboardList/><span>Orders</span>{inboxCounts.pendingOrders>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.pendingOrders>99?"99+":inboxCounts.pendingOrders}</b>}</Link>
      <Link className={activeClass(pathname==="/dashboard/analytics")} aria-current={pathname==="/dashboard/analytics"?"page":undefined} to="/dashboard/analytics"><BarChart3/><span>Analytics</span></Link>
      <Link className={`nav-with-count ${activeClass(pathname==="/dashboard/notifications")}`} aria-current={pathname==="/dashboard/notifications"?"page":undefined} to="/dashboard/notifications" aria-label={`Notifications${inboxCounts.unreadAlerts?`, ${inboxCounts.unreadAlerts} unread alerts`:""}`}><Bell/><span>Alerts</span>{inboxCounts.unreadAlerts>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.unreadAlerts>99?"99+":inboxCounts.unreadAlerts}</b>}</Link>
      <Link className={activeClass(pathname==="/account")} aria-current={pathname==="/account"?"page":undefined} to="/account"><UserRound/><span>Account</span></Link>
    </nav>;
  }
  if(user?.role==="SUPER_ADMIN"){
    return <nav className="mobile-bottom-nav" aria-label="Platform navigation">
      <Link className={activeClass(pathname==="/super-admin/applications")} aria-current={pathname==="/super-admin/applications"?"page":undefined} to="/super-admin/applications"><ShieldCheck/><span>Apps</span></Link>
      <Link className={activeClass(pathname==="/super-admin/alerts")} aria-current={pathname==="/super-admin/alerts"?"page":undefined} to="/super-admin/alerts"><Bell/><span>Alerts</span></Link>
      <Link className={activeClass(pathname==="/super-admin/upgrades")} aria-current={pathname==="/super-admin/upgrades"?"page":undefined} to="/super-admin/upgrades"><BarChart3/><span>Plans</span></Link>
      <button type="button" onClick={()=>logout()}><LogOut/><span>Sign out</span></button>
    </nav>;
  }
  return null;
}
