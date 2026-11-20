import {useCallback,useEffect,useState} from "react";
import {Link,Outlet,useHref,useLocation,useNavigate} from "react-router-dom";
import {ArrowRight,ArrowUpRight,BarChart3,Bell,Boxes,ClipboardList,CreditCard,Copy,ExternalLink,FolderKanban,LogOut,Menu,ShieldCheck,Store,Truck,UserRound,X} from "lucide-react";
import {useAuth} from "../context/useAuth";
import {api,getApiError} from "../lib/api";
import xyronLogo from "../assets/xyron-logo.webp";
import MobileBottomNav from "./MobileBottomNav";
import GlobalNotice from "./GlobalNotice";
import SocialLinks from "./SocialLinks";
import WholesaleSEO from "./WholesaleSEO";
import {notify} from "../lib/notifications";

const xyronSocialLinks={
  youtubeUrl:"https://youtube.com/@xyron_tech?si=TxNLumDpZEFMBmAY",
  instagramUrl:"https://www.instagram.com/xyronwebtech.websites?igsh=NDU1aXd0anM1dGdx",
  linkedinUrl:"https://www.linkedin.com/in/xyron-web-tech-13b306425/",
  facebookUrl:"https://www.facebook.com/xyronwebtech/"
};
const businessNavigation=[
  {label:"WORKSPACE",links:[["Products","/dashboard/products",Boxes],["Orders","/dashboard/orders",ClipboardList],["Notifications","/dashboard/notifications",Bell],["Analytics","/dashboard/analytics",BarChart3]]},
  {label:"STORE SETTINGS",links:[["Profile & sliders","/dashboard/profile",Store],["Payments","/dashboard/payments",CreditCard],["Shipping","/dashboard/shipping",Truck],["Upgrade plan","/dashboard/upgrade",ArrowUpRight]]}
];

export default function Shell(){
  const {user,logout,authError,apiConnectionMessage,refreshUser}=useAuth(),navigate=useNavigate(),{pathname}=useLocation(),storePathPrefix=useHref("/store/"),[menuOpen,setMenuOpen]=useState(false),[business,setBusiness]=useState(null),[storeBusiness,setStoreBusiness]=useState(null),[brandError,setBrandError]=useState(""),[storeError,setStoreError]=useState(""),[inboxError,setInboxError]=useState(""),[inboxCounts,setInboxCounts]=useState({pendingOrders:0,unreadAlerts:0});
  const userRole=user?.role,isHome=pathname==="/",isStore=pathname.startsWith("/store/"),isBusinessOwner=userRole==="BUSINESS_OWNER",isWholesaleAdmin=isBusinessOwner||userRole==="SUPER_ADMIN",storeSlug=pathname.match(/^\/store\/([^/]+)/)?.[1]||"";
  useEffect(()=>{
    let icon=document.querySelector('link[rel="icon"]');
    if(!icon){icon=document.createElement("link");icon.rel="icon";document.head.append(icon);}
    icon.type="image/webp";
    icon.href=xyronLogo;
  },[]);
  useEffect(()=>{
    if(!isBusinessOwner)return undefined;
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
    if(userRole!=="BUSINESS_OWNER")return;
    try{
      const {data}=await api.get("/business/inbox-counts");
      setInboxCounts({pendingOrders:data.pendingOrders||0,unreadAlerts:data.unreadAlerts||0});
      setInboxError("");
    }catch(error){setInboxError(getApiError(error));}
  },[userRole]);
  useEffect(()=>{
    if(userRole!=="BUSINESS_OWNER")return undefined;
    const refresh=()=>api.get("/business/inbox-counts").then(({data})=>{setInboxCounts({pendingOrders:data.pendingOrders||0,unreadAlerts:data.unreadAlerts||0});setInboxError("");}).catch(error=>setInboxError(getApiError(error)));
    refresh();
    const timer=window.setInterval(refresh,15000);
    window.addEventListener("focus",refresh);
    window.addEventListener("xyron:business-alert-read",refresh);
    return ()=>{window.clearInterval(timer);window.removeEventListener("focus",refresh);window.removeEventListener("xyron:business-alert-read",refresh);};
  },[userRole]);
  useEffect(()=>{
    if(!storeSlug)return undefined;
    let active=true;
    api.get(`/stores/${encodeURIComponent(storeSlug)}`).then(({data})=>{if(active){setStoreBusiness(data.business);setStoreError("");}}).catch(error=>{if(active)setStoreError(getApiError(error));});
    return ()=>{active=false;};
  },[storeSlug]);
  const visibleStoreBusiness=storeBusiness?.slug===storeSlug?storeBusiness:null;
  const visibleInboxCounts=userRole==="BUSINESS_OWNER"?inboxCounts:{pendingOrders:0,unreadAlerts:0};
  const visibleInboxError=userRole==="BUSINESS_OWNER"?inboxError:"";
  async function out(){await logout();navigate("/login");}
  async function copyStoreLink(){
    if(!business?.slug)return;
    try{
      await navigator.clipboard.writeText(new URL(`${storePathPrefix}${encodeURIComponent(business.slug)}`,window.location.origin).toString());
      notify("Store link copied.");
    }catch{
      notify("Could not copy the store link. Please copy it from the browser address bar.","error");
    }
  }
  const sectionLink=(id)=>isHome?`#${id}`:`/#${id}`;
  if(isStore)return <div className="shell store-shell"><WholesaleSEO path={pathname} business={visibleStoreBusiness} mode="store"/><GlobalNotice/><main className="store-main"><Outlet context={{storeBusiness:visibleStoreBusiness,storeError,storeSlug}}/></main><MobileBottomNav/></div>;
  return <div className={`shell${isWholesaleAdmin?" wholesale-admin-shell":""}`}>
    <WholesaleSEO path={pathname} business={isBusinessOwner?business:undefined} mode={isBusinessOwner||user?.role==="SUPER_ADMIN"?"admin":"public"}/>
    <GlobalNotice/>
    <header className={`site-header${isWholesaleAdmin?" wholesale-admin-header":""}`}>
      {isWholesaleAdmin&&<button className="menu-toggle business-sidebar-toggle" type="button" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>}
      <Link to="/" className="brand" aria-label="Xyron WebTech Wholesale home">{isBusinessOwner&&business?.logoUrl?<img className="business-shell-logo" src={business.logoUrl} alt=""/>:<img className="xyron-shell-logo" src={xyronLogo} alt=""/>}<span className="brand-name">{isBusinessOwner&&business?<><b>{business.name}</b><small>BUSINESS WORKSPACE</small></>:<><b>Xyron</b><strong>WebTech</strong><small>WHOLESALE</small></>}</span></Link>
      {!isWholesaleAdmin&&!user&&<button className="menu-toggle" type="button" onClick={()=>setMenuOpen(!menuOpen)} aria-label={menuOpen?"Close navigation":"Open navigation"} aria-expanded={menuOpen}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>}
      <nav className={`main-nav ${isBusinessOwner?"business-main-nav":""} ${menuOpen?"is-open":""}`} aria-label="Main navigation">
        {!user?<><Link onClick={()=>setMenuOpen(false)} to="/">Home</Link><Link onClick={()=>setMenuOpen(false)} to={sectionLink("how-we-work")}>How it works</Link><Link onClick={()=>setMenuOpen(false)} to={sectionLink("plans")}>Plans</Link><Link onClick={()=>setMenuOpen(false)} to="/login" className="nav-login">Sign in</Link><Link onClick={()=>setMenuOpen(false)} to="/register" className="nav-cta">Get started <ArrowUpRight size={16}/></Link></>:isBusinessOwner?<div className="business-header-actions"><span>Welcome, {user.name?.split(" ")[0]||"business owner"}</span><Link className="nav-account-link" to="/account"><UserRound size={15}/> Account</Link><button className="nav-logout" onClick={out}><LogOut size={15}/> Sign out</button></div>:<>{user.role==="SUPER_ADMIN"&&<><Link onClick={()=>setMenuOpen(false)} className="nav-dashboard" to="/super-admin/applications">Applications</Link><Link onClick={()=>setMenuOpen(false)} className="nav-dashboard" to="/super-admin/projects"><FolderKanban size={15}/> Projects</Link><Link onClick={()=>setMenuOpen(false)} className="nav-dashboard" to="/super-admin/alerts">Important alerts</Link><Link onClick={()=>setMenuOpen(false)} className="nav-dashboard" to="/super-admin/testimonials">Testimonials</Link><Link onClick={()=>setMenuOpen(false)} className="nav-dashboard" to="/super-admin/upgrades">Plan requests</Link></>}<Link onClick={()=>setMenuOpen(false)} className="nav-dashboard nav-account-link" to="/account"><UserRound size={15}/> Profile</Link><button className="nav-logout" onClick={out}><LogOut size={15}/> Sign out</button></>}
      </nav>
    </header>
    {apiConnectionMessage&&pathname!=="/login"&&pathname!=="/register"&&<div className="api-connecting" role="status" aria-live="polite">{apiConnectionMessage}</div>}
    {(authError||brandError||visibleInboxError)&&<div className="api-outage" role="alert"><span>{authError||brandError||visibleInboxError}</span><button type="button" onClick={()=>{if(brandError&&isBusinessOwner)api.get("/business/storefront").then(({data})=>{setBusiness(data.business);setBrandError("");}).catch(error=>setBrandError(getApiError(error)));else if(visibleInboxError)loadInboxCounts();else refreshUser().catch(()=>{});}}>Retry API connection</button></div>}
    {isBusinessOwner?<><button type="button" className={`business-sidebar-backdrop ${menuOpen?"visible":""}`} aria-label="Close dashboard navigation" onClick={()=>setMenuOpen(false)}/><div className="business-workspace-layout"><aside className={`business-sidebar ${menuOpen?"is-open":""}`} aria-label="Business workspace navigation"><div className="business-sidebar-brand"><span className="admin-section-kicker">YOUR STORE</span><strong>{business?.name||"Business workspace"}</strong><small>{business?.subscriptionPlan||"Wholesale"} plan</small></div>{businessNavigation.map(group=><section className="business-sidebar-group" key={group.label}><span className="business-sidebar-group-label">{group.label}</span>{group.links.map(([label,to,Icon])=><Link key={to} to={to} onClick={()=>setMenuOpen(false)} className={`business-sidebar-link ${pathname===to||(to==="/dashboard/products"&&pathname==="/dashboard")?"active":""}`} aria-current={pathname===to||(to==="/dashboard/products"&&pathname==="/dashboard")?"page":undefined}><Icon size={18}/><span>{label}</span>{to==="/dashboard/orders"&&visibleInboxCounts.pendingOrders>0&&<b className="business-sidebar-count">{visibleInboxCounts.pendingOrders>99?"99+":visibleInboxCounts.pendingOrders}</b>}{to==="/dashboard/notifications"&&visibleInboxCounts.unreadAlerts>0&&<b className="business-sidebar-count">{visibleInboxCounts.unreadAlerts>99?"99+":visibleInboxCounts.unreadAlerts}</b>}</Link>)}</section>)}<section className="business-sidebar-group business-sidebar-store"><span className="business-sidebar-group-label">YOUR STOREFRONT</span>{business?.slug&&<><Link className="business-sidebar-link" to={`/store/${encodeURIComponent(business.slug)}`} target="_blank" rel="noreferrer"><ExternalLink size={17}/><span>View shop</span></Link><button type="button" className="business-sidebar-link" onClick={copyStoreLink}><Copy size={17}/><span>Copy shop link</span></button></>}</section><section className="business-sidebar-group business-sidebar-footer"><Link className="business-sidebar-link" to="/account" onClick={()=>setMenuOpen(false)}><UserRound size={17}/><span>Account</span></Link><button type="button" className="business-sidebar-link" onClick={out}><LogOut size={17}/><span>Sign out</span></button></section></aside><main className={`business-workspace-main ${isHome&&!user?"landing-main":""}`}><Outlet context={{business}}/></main></div></>:<main className={isHome&&!user?"landing-main":""}><Outlet/></main>}
    {!isBusinessOwner&&<footer className="site-footer"><div className="footer-inner"><Link to="/" className="footer-brand">{isBusinessOwner&&business?.logoUrl?<img src={business.logoUrl} alt=""/>:<img className="xyron-footer-logo" src={xyronLogo} alt=""/>}<span>{isBusinessOwner&&business?<b>{business.name}</b>:<><b>Xyron</b> WebTech</>}</span></Link><p>{isBusinessOwner&&business?"Your independent wholesale workspace.":"Thoughtful digital tools for ambitious businesses."}</p><SocialLinks links={isBusinessOwner&&business?{...xyronSocialLinks,...business}:xyronSocialLinks} label={isBusinessOwner&&business?`${business.name} and Xyron WebTech social media`:"Xyron WebTech social media"} className="store-social-links footer-social-links"/><span className="footer-copy">© {new Date().getFullYear()} {isBusinessOwner&&business?business.name:"Xyron WebTech"} <i/> <ShieldCheck size={14}/> Built for independent businesses</span><a href="https://xyronwebtech.com" target="_blank" rel="noreferrer">Powered by XyronWebTech <ArrowRight size={14}/></a></div></footer>}
    <MobileBottomNav inboxCounts={visibleInboxCounts}/>
  </div>;
}
