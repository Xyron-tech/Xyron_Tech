import {useEffect,useMemo,useState} from "react";
import {Link,useLocation,useNavigate,useOutletContext,useParams} from "react-router-dom";
import {ArrowRight,Boxes,ChevronLeft,ChevronRight,Clock3,MessageCircle,Minus,PackageSearch,Plus,Search,ShieldCheck,ShoppingCart,Store,Trash2,Truck,UserRound,X} from "lucide-react";
import {api,getApiError} from "../lib/api";
import CustomerAuthForm from "../components/CustomerAuthForm";
import CustomerStorePage,{CustomerStoreFooter,CustomerStoreHeader,StoreDashboardLink} from "../components/CustomerStoreChrome";
import {notify} from "../lib/notifications";
import BrandLoader from "../../Components/BrandLoader";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const MIN_ORDER_WEIGHT_G=1000;
const unitName=product=>product.weightCalculationMethod==="PIECE"?"piece":"bundle";
const weightPerItem=product=>unitName(product)==="piece"?1000/Number(product.piecesPerKg):Number(product.bundleWeightGrams??product.packetWeightGrams);
function storeContact(business){
  const whatsappDigits=business?.whatsappNumber?.replace(/\D/g,"")||"";
  const phoneDigits=business?.contactPhone?.replace(/\D/g,"")||"";
  const contactDigits=whatsappDigits||phoneDigits;
  const international=contactDigits.length===10?`91${contactDigits}`:contactDigits.startsWith("0")?`91${contactDigits.slice(1)}`:contactDigits;
  if(whatsappDigits&&international.length>=11&&international.length<=15)return {href:`https://wa.me/${international}`,label:"Message the store on WhatsApp",isExternal:true};
  if(phoneDigits)return {href:`tel:${business.contactPhone.replace(/[^\d+]/g,"")}`,label:"Call the store",isExternal:false};
  return null;
}
const workflowSlides=[
  {icon:ShoppingCart,title:"Place your order",copy:"Save your delivery details to your account once, then order directly when your cart meets the 1 kg minimum."},
  {icon:Truck,title:"Follow order status",copy:"After ordering, open your order page to see whether the store has accepted or rejected it."},
  {icon:MessageCircle,title:"Chat with this store",copy:"Use the order-specific chat to ask this business about your order, payment, or delivery."}
];

function ProductCard({product,onAdd}){
  return <article className="product-card">
    <div className="product-image">{product.imageUrl?<img src={product.imageUrl} alt={product.name} loading="lazy"/>:<div className="product-image-fallback"><PackageSearch size={30}/><span>{product.category}</span></div>}<span className={product.stockPackets>0?"stock-badge":"stock-badge out"}>{product.stockPackets>0?"Available":"Out of stock"}</span></div>
    <div className="product-info"><span>{product.category}</span><h3>{product.name}</h3>{product.description&&<p>{product.description}</p>}<div className="product-meta"><b>{money.format(product.packetPrice)} <small>/ {unitName(product)}</small></b><span>{product.stockPackets} {unitName(product)}{product.stockPackets===1?"":"s"} in stock</span></div><div className="product-buy-row"><button type="button" disabled={!product.stockPackets} onClick={onAdd}><Plus size={14}/> Add 1 {unitName(product)}</button></div></div>
  </article>;
}

function StorefrontPage({slug}){
  const location=useLocation(),{storeBusiness}=useOutletContext(),navigate=useNavigate(),[business,setBusiness]=useState(null),[products,setProducts]=useState([]),[categories,setCategories]=useState([]),[category,setCategory]=useState(""),[searchDraft,setSearchDraft]=useState(null),[storeRetry,setStoreRetry]=useState(0),[productRetry,setProductRetry]=useState(0),[activeSlide,setActiveSlide]=useState(0),[activeWorkflow,setActiveWorkflow]=useState(0),[cart,setCart]=useState([]),[cartOpen,setCartOpen]=useState(false),[checkoutAuthOpen,setCheckoutAuthOpen]=useState(false),[minimumOrderOpen,setMinimumOrderOpen]=useState(false),[customerAccount,setCustomerAccount]=useState(null),[customerAccountError,setCustomerAccountError]=useState(""),[checkoutError,setCheckoutError]=useState(""),[checkoutBusy,setCheckoutBusy]=useState(false),[loadedSlug,setLoadedSlug]=useState(""),[error,setError]=useState("");
  const loading=loadedSlug!==slug;
  const urlQuery=new URLSearchParams(location.search).get("q")||"";
  const searchText=searchDraft?.search===location.search?searchDraft.text:urlQuery;
  const query=searchDraft?.search===location.search?searchDraft.query:urlQuery;
  function updateSearchText(text){setSearchDraft({search:location.search,text,query});}
  function updateSearchQuery(nextQuery){setSearchDraft({search:location.search,text:searchText,query:nextQuery});}
  function clearSearch(){setSearchDraft({search:location.search,text:"",query:""});}
  useEffect(()=>{
    let active=true;
    api.get(`/stores/${encodeURIComponent(slug)}`).then(({data})=>{
      if(active){setBusiness(data.business);setError("");setLoadedSlug(slug);}
    }).catch(error=>{
      if(active){setError(getApiError(error));setLoadedSlug(slug);notify(getApiError(error),"error");}
    });
    return ()=>{active=false;};
  },[slug,storeRetry]);
  useEffect(()=>{
    let active=true;
    async function refreshCustomerAccount(){
      try{
        const {data}=await api.get(`/stores/${encodeURIComponent(slug)}/customer/me`);
        if(!active)return;
        setCustomerAccount(data.customer);
        setCustomerAccountError("");
      }catch(error){
        if(!active)return;
        if(error?.response?.status===401){setCustomerAccount(null);return;}
        setCustomerAccountError(getApiError(error));
      }
    }
    refreshCustomerAccount();
    window.addEventListener("focus",refreshCustomerAccount);
    return ()=>{active=false;window.removeEventListener("focus",refreshCustomerAccount);};
  },[slug]);
  useEffect(()=>{
    if(!business||business.slug!==slug)return undefined;
    const timer=window.setTimeout(async()=>{
      try{
        const {data}=await api.get(`/stores/${encodeURIComponent(slug)}/products`,{params:{search:query,category}});
        setProducts(data.products);
        setCategories(data.categories);
      }catch(error){setError(getApiError(error));notify(getApiError(error),"error");}
    },180);
    return ()=>window.clearTimeout(timer);
  },[business,category,query,slug,productRetry]);
  useEffect(()=>{
    if(!new URLSearchParams(location.search).has("focusSearch"))return undefined;
    const frame=window.requestAnimationFrame(()=>document.querySelector(".customer-header .store-search input")?.focus({preventScroll:true}));
    return ()=>window.cancelAnimationFrame(frame);
  },[location.pathname,location.search,loading,products.length]);
  const slides=business?.sliderSlides||[];
  const businessContact=storeContact(business);
  const safeActiveSlide=slides.length?activeSlide%slides.length:0;
  useEffect(()=>{
    if(slides.length<2)return undefined;
    const timer=window.setInterval(()=>setActiveSlide(current=>(current+1)%slides.length),5000);
    return ()=>window.clearInterval(timer);
  },[slides.length]);
  const currentSlide=slides[safeActiveSlide];
  const activeWorkflowStep=workflowSlides[activeWorkflow],WorkflowIcon=activeWorkflowStep.icon;
  const visibleCategories=useMemo(()=>categories.slice(0,12),[categories]);
  const cartTotalWeightG=useMemo(()=>Number(cart.reduce((total,item)=>total+item.quantity*weightPerItem(item.product),0).toFixed(6)),[cart]);
  const cartSubtotalInr=useMemo(()=>cart.reduce((total,item)=>total+item.quantity*item.product.packetPrice,0),[cart]);
  function submitSearch(event){
    event.preventDefault();
    updateSearchQuery(searchText.trim());
    document.getElementById("products")?.scrollIntoView({behavior:"smooth"});
  }
  function chooseCategory(value){
    setCategory(value);
    document.getElementById("products")?.scrollIntoView({behavior:"smooth"});
  }
  function moveSlide(direction){
    if(slides.length<2)return;
    setActiveSlide((safeActiveSlide+direction+slides.length)%slides.length);
  }
  function addToCart(product){
    const quantity=1;
    const existing=cart.find(item=>item.product._id===product._id);
    if(quantity+(existing?.quantity||0)>product.stockPackets){setCheckoutError(`Only ${product.stockPackets} ${unitName(product)}${product.stockPackets===1?"":"s"} of ${product.name} are available.`);setCartOpen(true);return;}
    setCart(current=>existing
      ?current.map(item=>item.product._id===product._id?{...item,quantity:item.quantity+quantity}:item)
      :[...current,{product,quantity}]);
    setCheckoutError("");
    setCartOpen(true);
  }
  function updateCartQuantity(productId,quantity){
    const item=cart.find(entry=>entry.product._id===productId);
    if(!item)return;
    if(!Number.isSafeInteger(quantity)||quantity<1){setCart(current=>current.filter(entry=>entry.product._id!==productId));return;}
    if(quantity>item.product.stockPackets){setCheckoutError(`Only ${item.product.stockPackets} ${unitName(item.product)}${item.product.stockPackets===1?"":"s"} are available for ${item.product.name}.`);return;}
    setCheckoutError("");
    setCart(current=>current.map(entry=>entry.product._id===productId?{...entry,quantity}:entry));
  }
  async function placeOrder(account=customerAccount){
    setCheckoutError("");
    if(cartTotalWeightG<MIN_ORDER_WEIGHT_G){setMinimumOrderOpen(true);return;}
    if(!account){setCheckoutAuthOpen(true);return;}
    if(!account.customerName?.trim()||!account.deliveryAddress?.trim()||!/^\d{6}$/.test(account.pincode||"")||!account.district?.trim()||!account.state?.trim()){
      setCheckoutError("Complete your name, delivery address, pincode, district, and state in your customer profile before placing an order.");
      return;
    }
    setCheckoutBusy(true);
    try{
      const {data}=await api.post(`/stores/${encodeURIComponent(slug)}/orders`,{
        items:cart.map(item=>({productId:item.product._id,packetQuantity:item.quantity}))
      });
      localStorage.setItem(`xyron-order-${data.order.orderNumber}`,data.accessToken);
      localStorage.setItem(`xyron-last-order-${slug}`,data.order.orderNumber);
      setCart([]);
      setCartOpen(false);
      navigate(`/store/${encodeURIComponent(slug)}/orders/${encodeURIComponent(data.order.orderNumber)}`);
    }catch(error){setCheckoutError(getApiError(error));notify(getApiError(error),"error");}
    finally{setCheckoutBusy(false);}
  }
  async function customerSignedIn(account){
    setCustomerAccount(account);
    setCheckoutAuthOpen(false);
    setCheckoutError("");
    await placeOrder(account);
  }
  function moveWorkflow(direction){
    setActiveWorkflow(index=>(index+direction+workflowSlides.length)%workflowSlides.length);
  }

  if(loading)return <CustomerStorePage business={storeBusiness} slug={slug}><BrandLoader label="Loading this store"/></CustomerStorePage>;
  if(error||!business)return <CustomerStorePage business={storeBusiness} slug={slug}><div className="store-error"><Store size={28}/><h1>We couldn’t open this store</h1><p>{error||"This store could not be found."}</p><button className="secondary-button" type="button" onClick={()=>{setError("");setLoadedSlug("");setStoreRetry(value=>value+1);}}>Retry opening store</button><Link className="wholesale-back-link" to="/"><ArrowRight size={14}/> Back to Xyron Wholesale</Link></div></CustomerStorePage>;

  return <div className="customer-store">
    <CustomerStoreHeader business={business} slug={slug}>
      <form className="store-search" onSubmit={submitSearch} role="search">
        <Search size={18}/><input aria-label="Search products in this store" placeholder={`Search products in ${business.name}`} value={searchText} onChange={event=>updateSearchText(event.target.value)}/><button type="submit">Search <Search size={15}/></button>
      </form>
      <div className="store-header-actions"><Link className="customer-account-link" to={`/store/${encodeURIComponent(slug)}/account`} aria-label={customerAccount?"Open your profile":"Sign in to your account"}><UserRound size={15}/><span>{customerAccount?"Profile":"Sign in"}</span></Link><StoreDashboardLink/><button className="store-cart-button" type="button" onClick={()=>setCartOpen(true)}><ShoppingCart size={16}/> Cart <b>{cart.reduce((total,item)=>total+item.quantity,0)}</b></button></div>
    </CustomerStoreHeader>
    <nav className="store-nav" aria-label="Store categories">
      <button className={!category?"selected":""} onClick={()=>chooseCategory("")}><Boxes size={15}/> All products</button>
      {visibleCategories.slice(0,6).map(item=><button key={item} className={category===item?"selected":""} onClick={()=>chooseCategory(item)}>{item}</button>)}
      {visibleCategories.length>6&&<label className="store-more-categories">More categories <select aria-label="More product categories" value={category} onChange={event=>chooseCategory(event.target.value)}><option value="">All categories</option>{visibleCategories.slice(6).map(item=><option key={item} value={item}>{item}</option>)}</select></label>}
    </nav>

    <main className="store-content">
      <div className="store-top-layout">
        <aside className="category-panel">
          <div className="category-panel-title"><Boxes size={16}/> Shop by category</div>
          <button className={!category?"category-row chosen": "category-row"} onClick={()=>chooseCategory("")}>All products <ChevronRight size={15}/></button>
          {visibleCategories.map(item=><button key={item} className={category===item?"category-row chosen":"category-row"} onClick={()=>chooseCategory(item)}>{item}<ChevronRight size={15}/></button>)}
          <div className="category-panel-foot"><ShieldCheck size={15}/> Products from this store only</div>
        </aside>
        <section className="store-slider" aria-roledescription="carousel" aria-label={`${business.name} store banners`}>
          {currentSlide?<div className="store-slide" style={{backgroundImage:`linear-gradient(90deg,rgba(6,17,38,.88) 0%,rgba(6,17,38,.72) 58%,rgba(6,17,38,.44) 100%),linear-gradient(0deg,rgba(6,17,38,.28),transparent 42%),url("${currentSlide.imageUrl}")`}}>
            <div className="store-slide-copy"><span className="store-slide-tag">{business.category}</span><h1>{currentSlide.title}</h1>{currentSlide.subtitle&&<p>{currentSlide.subtitle}</p>}<a className="store-slide-button" href={currentSlide.buttonHref||"#products"}>{currentSlide.buttonLabel||"Explore products"} <ArrowRight size={16}/></a></div>
            {slides.length>1&&<div className="store-slide-controls"><button onClick={()=>moveSlide(-1)} aria-label="Previous banner"><ChevronLeft size={17}/></button><div>{slides.map((slide,index)=><button key={slide._id} className={index===safeActiveSlide?"active":""} aria-label={`Show banner ${index+1}`} aria-pressed={index===safeActiveSlide} onClick={()=>setActiveSlide(index)}/>)}</div><button onClick={()=>moveSlide(1)} aria-label="Next banner"><ChevronRight size={17}/></button></div>}
          </div>:<div className="store-slide store-slide-empty"><span className="store-slide-tag">{business.category}</span><h1>{business.name}</h1><p>{business.description||"Welcome to our wholesale store. Browse available products below."}</p><a className="store-slide-button" href="#products">Browse products <ArrowRight size={16}/></a><span className="empty-slider-note">Store banner images will appear here</span></div>}
        </section>
        <aside className="store-benefits" aria-label="Store information">
          <article><span className="benefit-icon benefit-blue"><PackageSearch size={19}/></span><b>Wholesale catalogue</b><small>Explore this store’s products</small></article>
          <article><span className="benefit-icon benefit-cyan"><ShieldCheck size={19}/></span><b>Direct with the business</b><small>Orders are handled by this store</small></article>
          <article><span className="benefit-icon benefit-violet"><Clock3 size={19}/></span><b>Business-managed</b><small>Availability is set by the owner</small></article>
        </aside>
      </div>

      <section className="products-section" id="products">
        <div className="products-heading"><div><span className="store-eyebrow">SHOP {business.name.toUpperCase()}</span><h2>{query?`Results for “${query}”`:category||"Products"}</h2><p>{products.length?`${products.length} product${products.length===1?"":"s"} shown from this store`:"Browse the products this business has added to its store."}</p></div><form className="products-inline-search" onSubmit={submitSearch}><Search size={16}/><input aria-label="Filter products" placeholder="Search these products" value={searchText} onChange={event=>updateSearchText(event.target.value)}/><button type="submit">Search</button></form></div>
        {error&&<div className="store-inline-error" role="alert">{error}<button type="button" onClick={()=>setProductRetry(value=>value+1)}>Retry</button></div>}
        {products.length?<div className="product-grid">{products.map(product=><ProductCard key={product._id} product={product} onAdd={()=>addToCart(product)}/>)}</div>:<div className="products-empty"><span><PackageSearch size={25}/></span><h3>{query||category?"No matching products":"This store is getting its catalogue ready"}</h3><p>{query||category?"Try another product name or choose a different category.":"Products added by this business will appear here. There are no sample products in this store."}</p>{query||category?<button onClick={()=>{clearSearch();setCategory("");}}>Show all products</button>:null}</div>}
      </section>
      {!query&&!category&&(business.storeSections||[]).map(section=>{
        const sectionProducts=section.productIds.map(id=>products.find(product=>product._id===id)).filter(Boolean);
        return sectionProducts.length?<section className="products-section custom-store-section" key={section._id}><div className="products-heading"><div><span className="store-eyebrow">{business.name.toUpperCase()}</span><h2>{section.title}</h2>{section.subtitle&&<p>{section.subtitle}</p>}</div></div><div className="product-grid">{sectionProducts.map(product=><ProductCard key={product._id} product={product} onAdd={()=>addToCart(product)}/>)}</div></section>:null;
      })}
      <section className="customer-workflow" aria-label="How ordering works">
        <div className="customer-workflow-heading"><span className="store-eyebrow">HOW IT WORKS</span><h2>Shop, track, and chat with {business.name}</h2><p>Your order stays connected to this store.</p></div>
        <div className="customer-workflow-slider" aria-roledescription="carousel">
          <button type="button" className="workflow-arrow" aria-label="Previous step" onClick={()=>moveWorkflow(-1)}><ChevronLeft size={18}/></button>
          <article className="workflow-slide" aria-live="polite"><span className="workflow-slide-icon"><WorkflowIcon size={22}/></span><div><small>STEP {activeWorkflow+1} OF {workflowSlides.length}</small><h3>{activeWorkflowStep.title}</h3><p>{activeWorkflowStep.copy}</p></div></article>
          <button type="button" className="workflow-arrow" aria-label="Next step" onClick={()=>moveWorkflow(1)}><ChevronRight size={18}/></button>
          <div className="workflow-dots">{workflowSlides.map((step,index)=><button type="button" key={step.title} className={index===activeWorkflow?"active":""} aria-label={`Show step ${index+1}: ${step.title}`} aria-pressed={index===activeWorkflow} onClick={()=>setActiveWorkflow(index)}/>)}</div>
        </div>
        <div className="customer-workflow-actions"><p>Sign in or create an account to place an order.</p><div><Link to={`/store/${encodeURIComponent(slug)}/account`}><UserRound size={15}/> Sign in</Link><Link className="create-account" to={`/store/${encodeURIComponent(slug)}/account?mode=register`}>Create account <ArrowRight size={15}/></Link></div></div>
      </section>
    </main>
    <CustomerStoreFooter business={business}/>
    {cartOpen&&<div className="cart-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setCartOpen(false);}}>
      <section className="store-cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
        <header><div><h2 id="cart-title">Your cart</h2><p>{business.name} · minimum order 1 kg</p></div><button type="button" aria-label="Close cart" onClick={()=>setCartOpen(false)}><X size={20}/></button></header>
        {cart.length?<>
          <div className="cart-items">{cart.map(item=><article className="cart-item" key={item.product._id}>
            <div><b>{item.product.name}</b><small>{item.quantity} {unitName(item.product)}{item.quantity===1?"":"s"}</small></div>
            <div className="cart-item-controls">
              <button type="button" aria-label={`Decrease ${item.product.name}`} disabled={item.quantity<=1} onClick={()=>updateCartQuantity(item.product._id,item.quantity-1)}><Minus size={16}/></button>
              <span aria-label={`${item.product.name} quantity`}>{item.quantity}</span>
              <button type="button" aria-label={`Increase ${item.product.name}`} disabled={item.quantity>=item.product.stockPackets} onClick={()=>updateCartQuantity(item.product._id,item.quantity+1)}><Plus size={16}/></button>
              <button type="button" className="remove-cart-item" aria-label={`Remove ${item.product.name}`} onClick={()=>setCart(current=>current.filter(entry=>entry.product._id!==item.product._id))}><Trash2 size={14}/></button>
            </div>
            <b className="cart-item-total">{money.format(item.product.packetPrice*item.quantity)}</b>
          </article>)}</div>
          {customerAccount?<div className="cart-checkout-form">
            <h3>Delivery details</h3>
            <p className="account-order-hint">Saved to your account · {customerAccount.phone}</p>
            <div className="saved-delivery-details">
              <label>Full name<input autoComplete="name" readOnly value={customerAccount.customerName||""} placeholder="Name not set"/></label>
              <label>Delivery address<textarea autoComplete="street-address" readOnly rows="2" value={customerAccount.deliveryAddress||""} placeholder="Address not set"/></label>
              <label>Delivery PIN<input autoComplete="postal-code" readOnly value={customerAccount.pincode||""} placeholder="PIN not set"/></label>
              <label>District<input readOnly value={customerAccount.district||""} placeholder="District not set"/></label>
              <label>State<input readOnly value={customerAccount.state||""} placeholder="State not set"/></label>
              <Link to={`/store/${encodeURIComponent(slug)}/account`}>Edit saved details</Link>
            </div>
            {customerAccountError&&<div className="store-inline-error" role="alert">{customerAccountError}</div>}
            {checkoutError&&<div className="error" role="alert">{checkoutError}</div>}
            <div className="cart-cost-row"><span>Products subtotal</span><b>{money.format(cartSubtotalInr)}</b></div>
            <p className="account-order-hint">The store will send the delivery amount and payment QR after reviewing your order.</p>
            <button className="primary" type="button" disabled={checkoutBusy} onClick={()=>placeOrder()}>{checkoutBusy?"Placing order…":"Place order"}</button>
          </div>:<div className="cart-checkout-form customer-checkout-auth">
            <h3>Sign in to place your order</h3>
            <p className="account-order-hint">Sign in or create your account once. Your saved delivery details will be used for future orders.</p>
            {customerAccountError&&<div className="store-inline-error" role="alert">{customerAccountError}</div>}
            {checkoutError&&<div className="error" role="alert">{checkoutError}</div>}
            {checkoutAuthOpen?<CustomerAuthForm slug={slug} onAuthenticated={customerSignedIn}/>:<button className="primary" type="button" disabled={checkoutBusy} onClick={()=>{if(cartTotalWeightG<MIN_ORDER_WEIGHT_G){setMinimumOrderOpen(true);return;}setCheckoutError("");setCheckoutAuthOpen(true);}}>Place order</button>}
          </div>}
        </>:<div className="cart-empty"><ShoppingCart size={28}/><b>Your cart is empty</b><span>Add products from this store to get started.</span></div>}
      </section>
      {minimumOrderOpen&&<div className="minimum-order-backdrop" onMouseDown={event=>{if(event.target===event.currentTarget)setMinimumOrderOpen(false);}}>
        <section className="minimum-order-dialog" role="dialog" aria-modal="true" aria-labelledby="minimum-order-title">
          <button className="minimum-order-close" type="button" aria-label="Close minimum order message" onClick={()=>setMinimumOrderOpen(false)}><X size={18}/></button>
          <span className="minimum-order-icon"><ShoppingCart size={21}/></span>
          <span className="store-eyebrow">MINIMUM ORDER</span>
          <h2 id="minimum-order-title">Orders start at 1 kg</h2>
          <p>Your cart is {(cartTotalWeightG/1000).toFixed(2)} kg. Add {Math.max(0,MIN_ORDER_WEIGHT_G-cartTotalWeightG).toFixed(0)} g or more to place an order. You can contact the store if you need help.</p>
          {businessContact?<a className="primary minimum-order-contact" href={businessContact.href} target={businessContact.isExternal?"_blank":undefined} rel={businessContact.isExternal?"noreferrer":undefined}><MessageCircle size={16}/>{businessContact.label}</a>:<p className="minimum-order-no-contact">This store has not added contact details yet.</p>}
          <button className="secondary-button minimum-order-continue" type="button" onClick={()=>{setMinimumOrderOpen(false);setCartOpen(false);}}>Continue shopping</button>
        </section>
      </div>}
    </div>}
  </div>;
}

export default function Storefront(){
  const {slug}=useParams();
  return <StorefrontPage key={slug} slug={slug}/>;
}
