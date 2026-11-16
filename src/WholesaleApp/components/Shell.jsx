import {useCallback,useEffect,useState} from "react";
import {Link,Outlet,useLocation,useNavigate} from "react-router-dom";
import {ArrowRight,ArrowUpRight,BarChart3,Boxes,ClipboardList,LogOut,Menu,MessageCircle,Search,ShieldCheck,UserRound,X} from "lucide-react";
import {useAuth} from "../context/AuthContext";
import {api,getApiError} from "../lib/api";
import xyronLogo from "../assets/xyron-logo.webp";
import MobileBottomNav from "./MobileBottomNav";
import GlobalNotice from "./GlobalNotice";
import SocialLinks from "./SocialLinks";
import WholesaleSEO from "./WholesaleSEO";

const xyronSocialLinks={
  youtubeUrl:"https://youtube.com/@xyron_tech?si=TxNLumDpZEFMBmAY",
  instagramUrl:"https://www.instagram.com/xyronwebtech.websites?igsh=NDU1aXd0anM1dGdx",
  linkedinUrl:"https://www.linkedin.com/in/xyron-web-tech-13b306425/",
  facebookUrl:"https://www.facebook.com/xyronwebtech/"
};

export default function Shell(){
  const {user,logout,authError,refreshUser}=useAuth(),navigate=useNavigate(),{pathname}=useLocation(),[menuOpen,setMenuOpen]=useState(false),[business,setBusiness]=useState(null),[storeBusiness,setStoreBusiness]=useState(null),[brandError,setBrandError]=useState(""),[storeError,setStoreError]=useState(""),[inboxError,setInboxError]=useState(""),[inboxCounts,setInboxCounts]=useState({pendingOrders:0,unreadConversations:0,unreadOrderMessages:0}),isHome=pathname==="/",isStore=pathname.startsWith("/store/"),isBusinessOwner=user?.role==="BUSINESS_OWNER",storeSlug=pathname.match(/^\/store\/([^/]+)/)?.[1]||"";
  useEffect(()=>{
    let icon=document.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement("link");icon.rel="icon";document.head.append(icon);}
    icon.type="image/webp";
    icon.href=xyronLogo;
  },[]);
  useEffect(()=>{
    if(!isBusinessOwner){setBusiness(null);return undefined;}
    let active=true;
    const load=()=>api.get("/business/storefront").then(({data})=>{if(active){setBusiness(data.business);setBrandError("");window.dispatchEvent(new CustomEvent("xyron:business-profile-updated",{detail:data.business}));}}).catch(error=>{if(active)setBrandError(getApiError(error));});
    const update=event=>{if(event.detail){setBusiness(event.detail);setBrandError("");}else load();};
    load();
    const timer=window.setInterval(load,5000);
    window.addEventListener("focus",load);
    window.addEventListener("xyron:business-profile-updated",update);
    return ()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",load);window.removeEventListener("xyron:business-profile-updated",update);};
  },[isBusinessOwner]);
  const loadInboxCounts=useCallback(async()=>{
    if(!["BUSINESS_OWNER","SUPER_ADMIN"].includes(user?.role||""))return;
    try{
      const endpoint=user.role==="BUSINESS_OWNER"?"/business/inbox-counts":"/super-admin/inbox-counts";
      const {data}=await api.get(endpoint);
      setInboxCounts({pendingOrders:data.pendingOrders||0,unreadConversations:data.unreadConversations||0,unreadOrderMessages:data.unreadOrderMessages||0});
      setInboxError("");
    }catch(error){setInboxError(getApiError(error));}
  },[user?.role]);
  useEffect(()=>{
    if(!["BUSINESS_OWNER","SUPER_ADMIN"].includes(user?.role||"")){
      setInboxCounts({pendingOrders:0,unreadConversations:0,unreadOrderMessages:0});setInboxError("");return undefined;
    }
    loadInboxCounts();
    const timer=window.setInterval(loadInboxCounts,15000);
    window.addEventListener("focus",loadInboxCounts);
    window.addEventListener("xyron:order-chat-read",loadInboxCounts);
    return ()=>{window.clearInterval(timer);window.removeEventListener("focus",loadInboxCounts);window.removeEventListener("xyron:order-chat-read",loadInboxCounts);};
  },[user?.role,loadInboxCounts]);
  useEffect(()=>{
    if(!storeSlug){setStoreBusiness(null);setStoreError("");return undefined;}
    let active=true;
    api.get(`/stores/${encodeURIComponent(storeSlug)}`).then(({data})=>{if(active){setStoreBusiness(data.business);setStoreError("");}}).catch(error=>{if(active){setStoreBusiness(null);setStoreError(getApiError(error));}});
    return ()=>{active=false;};
  },[storeSlug]);
  async function out(){await logout();navigate("/login");}
  const sectionLink=(id)=>isHome?`#${id}`:`/#${id}`;
  if(isStore)return <div className="shell store-shell"><WholesaleSEO path={pathname} business={storeBusiness} mode="store"/><GlobalNotice/><main className="store-main"><Outlet context={{storeBusiness,storeError,storeSlug}}/></main><MobileBottomNav/></div>;
  return <div className="shell">
    <WholesaleSEO path={pathname} business={isBusinessOwner?business:undefined} mode={isBusinessOwner||user?.role==="SUPER_ADMIN"?"admin":"public"}/>
    <GlobalNotice/>
    <header className="site-header">
      <Link to="/" className="brand" aria-label="Xyron WebTech Wholesale home">{isBusinessOwner&&business?.logoUrl?<img className="business-shell-logo" src={business.logoUrl} alt=""/>:<img className="xyron-shell-logo" src={xyronLogo} alt=""/>}<span className="brand-name">{isBusinessOwner&&business?<><b>{business.name}</b><small>BUSINESS WORKSPACE</small></>:<><b>Xyron</b><strong>WebTech</strong><small>WHOLESALE</small></>}</span></Link>
      {!user&&<button className="menu-toggle" type="button" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>}
      <nav className={`main-nav ${isBusinessOwner?"business-main-nav":""} ${menuOpen?"is-open":""}`} aria-label="Main navigation">
        {!user?<><Link onClick={()=>setMenuOpen(false)} to="/">Home</Link><Link onClick={()=>setMenuOpen(false)} to={sectionLink("how-we-work")}>How it works</Link><Link onClick={()=>setMenuOpen(false)} to={sectionLink("plans")}>Plans</Link><Link onClick={()=>setMenuOpen(false)} to="/login" className="nav-login">Sign in</Link><Link onClick={()=>setMenuOpen(false)} to="/register" className="nav-cta">Get started <ArrowUpRight size={16}/></Link></>:<>{user.role==="BUSINESS_OWNER"&&<div className="business-nav-actions"><Link className="nav-dashboard nav-icon" to="/dashboard/products" title="Products" aria-label="Products" aria-current={pathname==="/dashboard"||pathname==="/dashboard/products"?"page":undefined}><Boxes size={18}/><span>Products</span></Link><Link className="nav-dashboard nav-icon nav-with-count" to="/dashboard/orders" title="Orders" aria-label={`Orders${inboxCounts.pendingOrders?`, ${inboxCounts.pendingOrders} pending`:""}${inboxCounts.unreadOrderMessages?`, ${inboxCounts.unreadOrderMessages} unread chat messages`:""}`} aria-current={pathname==="/dashboard/orders"?"page":undefined}><ClipboardList size={18}/><span>Orders</span>{inboxCounts.pendingOrders>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.pendingOrders>99?"99+":inboxCounts.pendingOrders}</b>}{inboxCounts.unreadOrderMessages>0&&<b className="nav-chat-count-badge" aria-hidden="true">{inboxCounts.unreadOrderMessages>99?"99+":inboxCounts.unreadOrderMessages}</b>}</Link><Link className="nav-dashboard nav-icon" to="/dashboard/analytics" title="Analytics" aria-label="Analytics" aria-current={pathname==="/dashboard/analytics"?"page":undefined}><BarChart3 size={18}/><span>Analytics</span></Link><Link className="nav-dashboard nav-icon nav-with-count" to="/dashboard/support" title="Support inbox" aria-label={`Support inbox${inboxCounts.unreadConversations?`, ${inboxCounts.unreadConversations} unread conversations`:""}`} aria-current={pathname==="/dashboard/support"?"page":undefined}><MessageCircle size={18}/><span>Support</span>{inboxCounts.unreadConversations>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.unreadConversations>99?"99+":inboxCounts.unreadConversations}</b>}</Link>{business?.slug&&<Link className="nav-dashboard nav-icon" to={`/store/${encodeURIComponent(business.slug)}?focusSearch=1#products`} title="Search store products" aria-label="Search store products"><Search size={18}/><span>Search</span></Link>}</div>}{user.role==="SUPER_ADMIN"&&<><Link className="nav-dashboard" to="/super-admin/applications">Applications</Link><Link className="nav-dashboard nav-with-count" to="/super-admin/support" aria-label={`Inbox and broadcasts${inboxCounts.unreadConversations?`, ${inboxCounts.unreadConversations} unread conversations`:""}`}>Inbox & broadcasts{inboxCounts.unreadConversations>0&&<b className="nav-count-badge" aria-hidden="true">{inboxCounts.unreadConversations>99?"99+":inboxCounts.unreadConversations}</b>}</Link><Link className="nav-dashboard" to="/super-admin/testimonials">Testimonials</Link><Link className="nav-dashboard" to="/super-admin/upgrades">Plan requests</Link></>}<Link className="nav-dashboard nav-account-link" to="/account"><UserRound size={15}/> Profile</Link><button className="nav-logout" onClick={out}><LogOut size={15}/> Sign out</button></>}
      </nav>
    </header>
    {(authError||brandError||inboxError)&&<div className="api-outage" role="alert"><span>{authError||brandError||inboxError}</span><button type="button" onClick={()=>{if(brandError&&isBusinessOwner)api.get("/business/storefront").then(({data})=>{setBusiness(data.business);setBrandError("");}).catch(error=>setBrandError(getApiError(error)));else if(inboxError)loadInboxCounts();else refreshUser().catch(()=>{});}}>Retry API connection</button></div>}
    <main className={isHome&&!user?"landing-main":""}><Outlet/></main>
    <footer className="site-footer"><div className="footer-inner"><Link to="/" className="footer-brand">{isBusinessOwner&&business?.logoUrl?<img src={business.logoUrl} alt=""/>:<img className="xyron-footer-logo" src={xyronLogo} alt=""/>}<span>{isBusinessOwner&&business?<b>{business.name}</b>:<><b>Xyron</b> WebTech</>}</span></Link><p>{isBusinessOwner&&business?"Your independent wholesale workspace.":"Thoughtful digital tools for ambitious businesses."}</p><SocialLinks links={isBusinessOwner&&business?{...xyronSocialLinks,...business}:xyronSocialLinks} label={isBusinessOwner&&business?`${business.name} and Xyron WebTech social media`:"Xyron WebTech social media"} className="store-social-links footer-social-links"/><span className="footer-copy">© {new Date().getFullYear()} {isBusinessOwner&&business?business.name:"Xyron WebTech"} <i/> <ShieldCheck size={14}/> Built for independent businesses</span><a href="https://xyronwebtech.com" target="_blank" rel="noreferrer">Powered by XyronWebTech <ArrowRight size={14}/></a></div></footer>
    <MobileBottomNav inboxCounts={inboxCounts}/>
  </div>;
}
