import {useEffect,useState} from "react";
import {Link,useNavigate} from "react-router-dom";
import {Bell,ChevronRight,MapPin,Menu,MessageCircle,Phone,Search,Store,UserRound,X} from "lucide-react";
import {useAuth} from "../context/useAuth";
import {api} from "../lib/api";
import {getStorePhoneHref,getStoreWhatsAppNumber} from "../lib/storeContactLinks";
import SocialLinks from "./SocialLinks";

export function StoreDashboardLink(){
  const {user}=useAuth();
  return user?.role==="BUSINESS_OWNER"?<Link className="customer-account-link store-dashboard-link" to="/dashboard/products" aria-label="Return to business dashboard"><Store size={17}/><span>Dashboard</span></Link>:null;
}

export function CustomerStoreHeader({business,slug,children,categories=[],onSelectCategory}){
  const [announcementIndex,setAnnouncementIndex]=useState(0),[menuOpen,setMenuOpen]=useState(false);
  const announcements=business.announcements?.length?business.announcements:business.announcementText?.trim()?[{title:business.announcementTitle?.trim()||"FROM THE STORE",text:business.announcementText.trim()}]:[
    {title:"SHOP DIRECT",text:`Explore wholesale products from ${business.name}.`},
    {title:"ORDER UPDATES",text:"Track your order and view bills from Orders."},
    {title:"STORE INFORMATION",text:`Prices and availability are managed by ${business.name}.`}
  ];
  const activeAnnouncement=announcements[announcementIndex%announcements.length]||announcements[0];
  const announcementSignature=JSON.stringify(announcements);
  useEffect(()=>{
    if(announcements.length<2||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return undefined;
    const timer=window.setInterval(()=>setAnnouncementIndex(index=>(index+1)%announcements.length),5000);
    return ()=>window.clearInterval(timer);
  },[announcements.length,announcementSignature]);
  return <>
    <div className="store-announcement" role="region" aria-label="Store announcement"><span className="store-announcement-title"><Store size={14}/>{activeAnnouncement.title||"FROM THE STORE"}</span><span className="store-announcement-message" key={announcementIndex}><span className="store-announcement-track"><span>{activeAnnouncement.text}</span><span aria-hidden="true">{activeAnnouncement.text}</span></span></span></div>
    <header className="customer-header">
      <button className="store-menu-toggle" type="button" aria-label={menuOpen?"Close store menu":"Open store menu"} aria-expanded={menuOpen} onClick={()=>setMenuOpen(open=>!open)}>{menuOpen?<X size={21}/>:<Menu size={21}/>}</button>
      <Link to={`/store/${encodeURIComponent(slug)}`} className="store-brand"><span className="store-brand-icon">{business.logoUrl?<img src={business.logoUrl} alt={`${business.name} logo`}/>:<Store size={20}/>}</span><span><b>{business.name}</b><small>{business.category}</small></span></Link>
      {children}
      {menuOpen&&<nav className="store-mobile-menu" aria-label="Store menu"><span className="store-mobile-menu-label">SHOP BY CATEGORY</span><button type="button" onClick={()=>{onSelectCategory?.("");setMenuOpen(false);}}>All products <ChevronRight size={16}/></button>{categories.map(category=><button type="button" key={category} onClick={()=>{onSelectCategory?.(category);setMenuOpen(false);}}>{category}<ChevronRight size={16}/></button>)}<span className="store-mobile-menu-label">YOUR ACCOUNT</span><Link to={`/store/${encodeURIComponent(slug)}/orders`} onClick={()=>setMenuOpen(false)}>Orders and updates <ChevronRight size={16}/></Link><Link to={`/store/${encodeURIComponent(slug)}/account`} onClick={()=>setMenuOpen(false)}>Profile and sign in <ChevronRight size={16}/></Link></nav>}
    </header>
  </>;
}

export function CustomerStoreFooter({business}){
  const phone=business.contactPhone?.trim();
  const phoneHref=getStorePhoneHref(phone);
  const whatsapp=getStoreWhatsAppNumber(business.whatsappNumber);
  const map=business.location?.lat!=null&&business.location?.lng!=null?`https://www.openstreetmap.org/export/embed.html?bbox=${business.location.lng-0.015}%2C${business.location.lat-0.01}%2C${business.location.lng+0.015}%2C${business.location.lat+0.01}&layer=mapnik&marker=${business.location.lat}%2C${business.location.lng}`:"";
  const address=[business.address,business.city,business.state,business.pincode].filter(Boolean).join(", ");
  return <footer className="store-footer"><div className="store-footer-brand">{business.logoUrl?<img src={business.logoUrl} alt={`${business.name} logo`}/>:<Store size={17}/>}<span>© {new Date().getFullYear()} {business.name}</span></div><div className="store-footer-details">{address&&<span className="store-footer-address"><MapPin size={14}/>{address}</span>}<div className="store-footer-contact">{phone&&<a href={phoneHref}><Phone size={14}/>Call</a>}{whatsapp&&<a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noreferrer"><MessageCircle size={14}/>WhatsApp</a>}</div>{map&&<div className="store-footer-map"><iframe title={`${business.name} approximate PIN area map`} loading="lazy" referrerPolicy="no-referrer" src={map}/><span>Approximate area map</span></div>}</div><div className="store-footer-meta"><SocialLinks links={business} label={`${business.name} social media`} className="store-social-links"/><span>Powered by <b>XyronWebTech</b></span></div></footer>;
}

export default function CustomerStorePage({business,slug,children,isSignedIn}){
  const navigate=useNavigate(),[searchText,setSearchText]=useState(""),[unreadOrderUpdates,setUnreadOrderUpdates]=useState(0);
  const store=business||{name:slug,slug,category:"Wholesale",logoUrl:""};
  const storePath=`/store/${encodeURIComponent(slug)}`;
  useEffect(()=>{
    let active=true;
    const loadUnreadUpdates=async()=>{
      try{
        const {data}=await api.get(`/stores/${encodeURIComponent(slug)}/customer/inbox-counts`);
        if(active)setUnreadOrderUpdates(data.unreadOrderUpdates||0);
      }catch(error){
        if(!active)return;
        if(error?.response?.status===401)setUnreadOrderUpdates(0);
        else console.error("Could not load unread customer order updates.",error);
      }
    };
    loadUnreadUpdates();
    const timer=window.setInterval(loadUnreadUpdates,15000);
    window.addEventListener("focus",loadUnreadUpdates);
    window.addEventListener("xyron:customer-order-notification-read",loadUnreadUpdates);
    return ()=>{active=false;window.clearInterval(timer);window.removeEventListener("focus",loadUnreadUpdates);window.removeEventListener("xyron:customer-order-notification-read",loadUnreadUpdates);};
  },[slug,isSignedIn]);
  function submitSearch(event){
    event.preventDefault();
    const params=new URLSearchParams();
    const query=searchText.trim();
    if(query)params.set("q",query);
    params.set("focusSearch","1");
    navigate(`${storePath}?${params.toString()}#products`);
  }
  return <div className="customer-page-shell">
    <CustomerStoreHeader business={store} slug={slug}>
      <form className="store-search" onSubmit={submitSearch} role="search">
        <Search size={18}/>
        <input aria-label={`Search products in ${store.name}`} placeholder={`Search products in ${store.name}`} value={searchText} onChange={event=>setSearchText(event.target.value)}/>
        <button type="submit">Search <Search size={15}/></button>
      </form>
      <div className="store-header-actions">
        <Link className="customer-account-link customer-orders-header-link" to={`${storePath}/orders`} aria-label={`Orders${unreadOrderUpdates?`, ${unreadOrderUpdates} unread order updates`:""}`}><Bell size={17}/><span>Orders</span>{unreadOrderUpdates>0&&<b className="customer-header-unread-badge" aria-hidden="true">{unreadOrderUpdates>99?"99+":unreadOrderUpdates}</b>}</Link>
        <Link className="customer-account-link" to={`${storePath}/account`} aria-label={isSignedIn?"Open your customer profile":"Sign in to your account"}><UserRound size={17}/><span>{isSignedIn?"Profile":"Sign in"}</span></Link>
        <StoreDashboardLink/>
      </div>
    </CustomerStoreHeader>
    <div className="customer-page-body">{children}</div>
    <CustomerStoreFooter business={store}/>
  </div>;
}
