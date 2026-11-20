import {useEffect,useState} from "react";
import {Link} from "react-router-dom";
import {ArrowRight,ArrowUpRight,Bell,Boxes,Check,ChevronLeft,ChevronRight,CreditCard,Layers3,Package,ShieldCheck,Store,Truck,Workflow} from "lucide-react";
import HowWeWork from "../../Components/HowWeWork/HowWeWork";
import {planCatalog} from "../data/planCatalog";
import Testimonials from "../../Components/Testimonials/Testimonials";

const slides=[
  {eyebrow:"WHOLESALE, REIMAGINED",title:<>Your business.<br/><em>Your own store.</em></>,copy:"Start affordable wholesale management from ₹199 per month with your own products, branding, orders, and customer notifications.",label:"One business, one storefront",icon:Store},
  {eyebrow:"MADE FOR WHOLESALE",title:<>Your products.<br/><em>Managed your way.</em></>,copy:"Manage product details, pricing, stock, store banners, and checkout settings from your business workspace.",label:"A catalogue built around you",icon:Package},
  {eyebrow:"ONE CONNECTED WORKSPACE",title:<>From first order<br/><em>to delivery.</em></>,copy:"Review orders, calculate delivery from customer PIN codes, and send payment instructions directly to each order.",label:"Orders, delivery, and payments together",icon:Workflow}
];

const modules=[
  {number:"01",title:"Your own storefront",copy:"Set your store name, logo, banner, social links, and unique customer-facing URL.",icon:Store,tone:"blue",status:"Available"},
  {number:"02",title:"Products & inventory",copy:"Add products, set wholesale prices and quantities, and manage availability in your catalogue.",icon:Boxes,tone:"violet",status:"Available"},
  {number:"03",title:"Orders & delivery",copy:"Review customer orders, set location-based per-kg delivery rates, and call or WhatsApp customers when a rate needs confirmation.",icon:Truck,tone:"cyan",status:"Available"},
  {number:"04",title:"Payments & customer alerts",copy:"Enable a QR or UPI payment option and automatically notify customers with open orders when payment details change.",icon:CreditCard,tone:"green",status:"Available"},
  {number:"05",title:"Platform updates",copy:"Receive important announcements from Xyron Super Admin in your dashboard notifications.",icon:Bell,tone:"blue",status:"Available"}
];

export default function Home(){
  const [active,setActive]=useState(0),slide=slides[active],Illustration=slide.icon;
  useEffect(()=>{
    if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return undefined;
    const timer=window.setInterval(()=>setActive(index=>(index+1)%slides.length),6000);
    return ()=>window.clearInterval(timer);
  },[]);
  const previous=()=>setActive((active+slides.length-1)%slides.length);
  const next=()=>setActive((active+1)%slides.length);

  return <>
    <div className="landing" id="top">
      <section className="hero" aria-roledescription="carousel" aria-label="Xyron Wholesale introduction">
        <div className="hero-inner">
          <div className="hero-copy" key={active}>
            <span className="eyebrow"><i/> {slide.eyebrow}</span>
            <h1>{slide.title}</h1>
            <p>{slide.copy}</p>
            <div className="hero-actions">
              <Link className="button button-primary" to="/register">Start your store <ArrowUpRight size={17}/></Link>
              <a className="button button-secondary" href="#showcase">Explore the platform</a>
            </div>
            <div className="hero-proof"><Check size={15}/> Plans from ₹199/month <b>·</b> Independent stores <b>·</b> Built to grow</div>
          </div>
          <div className="hero-art" aria-label={slide.label} role="img">
            <div className="art-glow"/>
            <div className="art-float art-float-top"><ShieldCheck size={17}/><span>Business-first<br/><b>by design</b></span></div>
            <div className="store-preview">
              <div className="preview-top"><span className="preview-dot"/><span className="preview-dot"/><span className="preview-dot"/><span className="preview-site">xyron wholesale</span><span className="preview-lock"><ShieldCheck size={13}/></span></div>
              <div className="preview-content">
                <div className="preview-label">YOUR WHOLESALE WORKSPACE</div>
                <div className="preview-headline">{slide.label}</div>
                <div className="preview-line preview-line-long"/><div className="preview-line"/>
                <div className="preview-cards">
                  {[Store,Package,Truck].map((Icon,index)=><div className="preview-card" key={index}><span><Icon size={18}/></span><i/><i/></div>)}
                </div>
                <div className="preview-status"><span/><b>One business at a time</b><small>Designed for your store</small></div>
              </div>
            </div>
            <div className="art-float art-float-bottom"><Illustration size={18}/><span>{slide.label}</span></div>
            <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          </div>
          <div className="slider-controls">
            <div className="slider-dots" role="group" aria-label="Choose a slide">{slides.map((item,index)=><button type="button" key={item.eyebrow} className={index===active?"active":""} aria-label={`Show slide ${index+1}: ${item.eyebrow}`} aria-pressed={index===active} onClick={()=>setActive(index)}/>)}</div>
            <button type="button" className="slider-arrow" onClick={previous} aria-label="Previous slide"><ChevronLeft size={20}/></button>
            <button type="button" className="slider-arrow" onClick={next} aria-label="Next slide"><ChevronRight size={20}/></button>
          </div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Platform principles">
        <span><ShieldCheck/> Tenant-aware store access</span><i/><span><Store/> Independent business stores</span><i/><span><Layers3/> One connected workspace</span>
      </section>

      <section className="showcase section-wrap" id="showcase">
        <div className="section-heading">
          <span className="eyebrow"><i/> THE WHOLESALE WORKSPACE</span>
          <h2>Everything your store needs,<br/><em>all in one direction.</em></h2>
          <p>Explore the tools available to manage your business-specific wholesale storefront.</p>
        </div>
        <div className="module-grid">
          {modules.map(({number,title,copy,icon:Icon,tone,status})=><article className="module-card" key={number}>
            <div className={`module-icon ${tone}`}><Icon size={22}/></div>
            <span className="module-number">{number} / WHOLESALE MODULE</span>
            <h3>{title}</h3><p>{copy}</p>
            <div className="module-status"><span/>{status}</div>
          </article>)}
        </div>
        <div className="platform-note"><span className="note-icon"><ShieldCheck size={20}/></span><p><b>Your business stays separate.</b><br/>Products, orders, customer alerts, and store settings are scoped to the correct business workspace.</p><Link to="/register">Apply for a business account <ArrowRight size={16}/></Link></div>
      </section>

      <section className="plans-section section-wrap" id="plans">
        <div className="section-heading">
          <span className="eyebrow"><i/> SIMPLE MONTHLY PLANS</span>
          <h2>Start with the plan<br/><em>that fits your business.</em></h2>
          <p>Every plan gives your business its own independent storefront. Xyron Admin reviews plan access before activation.</p>
        </div>
        <div className="landing-plan-grid">
          {planCatalog.map((plan,index)=><article className={`landing-plan-card ${index===2?"featured":""}`} key={plan.id}>
            {index===2&&<span className="landing-plan-badge">MOST CAPABLE</span>}
            <h3>{plan.name}</h3>
            <p className="landing-plan-price">₹{plan.price}<small>/month</small></p>
            <p className="landing-plan-limits">{plan.products} · {plan.slides}</p>
            <ul>{plan.features.map(feature=><li key={feature}><Check size={15}/>{feature}</li>)}</ul>
            <Link to="/register" className={index===2?"button button-primary":"button button-secondary"}>Choose {plan.name} <ArrowRight size={15}/></Link>
          </article>)}
        </div>
      </section>

      <Testimonials/>
      <HowWeWork variant="wholesale"/>

      <section className="cta-section section-wrap" id="about">
        <div><span className="eyebrow"><i/> YOUR NEXT CHAPTER STARTS HERE</span><h2>Ready to bring your<br/><em>wholesale business online?</em></h2><p>Manage your wholesale store online with plans starting at ₹199 per month. Create your business account and get started after approval.</p></div>
        <Link to="/register" className="button button-primary">Apply for a business account <ArrowUpRight size={17}/></Link>
      </section>
    </div>
  </>;
}
