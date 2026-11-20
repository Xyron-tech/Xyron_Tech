import {useEffect,useMemo,useRef,useState} from "react";
import {Link,useLocation,useNavigate,useOutletContext,useParams} from "react-router-dom";
import {ArrowRight,Boxes,ChevronLeft,ChevronRight,MessageCircle,Minus,PackageSearch,Phone,Plus,Search,ShoppingCart,Store,Trash2,UserRound,X,ZoomIn} from "lucide-react";
import {api,getApiError} from "../lib/api";
import CustomerAuthForm from "../components/CustomerAuthForm";
import CustomerStorePage,{CustomerStoreFooter,CustomerStoreHeader,StoreDashboardLink} from "../components/CustomerStoreChrome";
import {getStorePhoneHref,getStoreWhatsAppNumber} from "../lib/storeContactLinks";
import {groupCatalogProductsBySection} from "../lib/storeSectionCatalog";
import {notify} from "../lib/notifications";
import BrandLoader from "../../Components/BrandLoader";

const money=new Intl.NumberFormat("en-IN",{style:"currency",currency:"INR",maximumFractionDigits:2});
const unitName=product=>product.weightCalculationMethod==="PIECE"?"piece":"bundle";
const weightPerItem=product=>unitName(product)==="piece"?1000/Number(product.piecesPerKg):Number(product.bundleWeightGrams??product.packetWeightGrams);
const formatWeight=grams=>grams>=1000?`${Number((grams/1000).toFixed(2))} kg`:`${Math.ceil(grams)} g`;
function renderMinimumOrderText(template,values){
  return String(template||"").replace(/\{(remainingUnits|unitLabel|remainingWeight|minimumWeight)\}/g,(_match,key)=>values[key]??"");
}
function estimateAdditionalUnits(cart,remainingWeight){
  const maximumUnitWeight=Math.max(0,...cart.map(item=>weightPerItem(item.product)));
  return maximumUnitWeight?Math.ceil(remainingWeight/maximumUnitWeight):1;
}
function ProductPhoto({product,className,fallbackClass,loading="lazy"}){
  const [failedImageUrl,setFailedImageUrl]=useState("");
  const failed=Boolean(product.imageUrl&&failedImageUrl===product.imageUrl);
  if(!product.imageUrl||failed)return <div className={fallbackClass} role="img" aria-label={`${product.name} image ${failed?"could not load":"not available"}`}><PackageSearch size={30}/><span>{failed?"Image could not load":"No product image"}</span></div>;
  return <img className={className} src={product.imageUrl} alt={product.name} loading={loading} decoding="async" onError={()=>setFailedImageUrl(product.imageUrl)}/>;
}
function ProductCard({product,onAdd,onZoom}){
  const perPiece=unitName(product)==="piece";
  const piecesPerUnit=perPiece?1:product.piecesPerBundle??product.piecesPerPacket;
  return <article className="product-card">
    <div className="product-image"><button className="product-image-zoom" type="button" aria-label={`View ${product.name} details and image`} onClick={()=>onZoom(product)}><ProductPhoto product={product} className="product-card-photo" fallbackClass="product-image-fallback"/>{product.imageUrl&&<span className="product-image-zoom-indicator" aria-hidden="true"><ZoomIn size={16}/></span>}</button><span className={product.stockPackets>0?"stock-badge":"stock-badge out"}>{product.stockPackets>0?"Available":"Out of stock"}</span></div>
    <div className="product-info"><span>{product.category}</span><strong className="product-price">{money.format(product.packetPrice)} <small>/ {perPiece?"piece":"bundle"}</small></strong><h3>{product.name}</h3>{product.description&&<p>{product.description}</p>}<div className="product-specs">{piecesPerUnit!=null&&<span><b>{piecesPerUnit}</b><small>{perPiece?"piece":"pieces / bundle"}</small></span>}</div><div className="product-meta"><span>{product.stockPackets} {unitName(product)}{product.stockPackets===1?"":"s"} in stock</span></div><div className="product-buy-row"><button type="button" disabled={!product.stockPackets} onClick={onAdd}><Plus size={14}/> Add {perPiece?"piece":"bundle"}</button></div></div>
  </article>;
}

function FeaturedProductCarousel({products,onAdd,onZoom}){
  const [activeIndex,setActiveIndex]=useState(0);
  const visibleIndex=activeIndex%products.length;
  const product=products[visibleIndex];
  const perPiece=unitName(product)==="piece";
  const pieces=perPiece?1:product.piecesPerBundle??product.piecesPerPacket;

  useEffect(()=>{
    if(products.length<2||window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return undefined;
    const timer=window.setInterval(()=>setActiveIndex(index=>(index+1)%products.length),5000);
    return ()=>window.clearInterval(timer);
  },[products.length]);

  function move(direction){
    setActiveIndex(index=>(index+direction+products.length)%products.length);
  }

  return <section className="featured-product-carousel" aria-label="Store favorite products">
    <article className="featured-product-card" aria-live="polite">
      <div className="featured-product-image" key={`image-${product._id}`}><button className="featured-product-image-zoom" type="button" aria-label={`View ${product.name} details and image`} onClick={()=>onZoom(product)}><ProductPhoto product={product} className="featured-product-photo" fallbackClass="featured-product-fallback"/>{product.imageUrl&&<span className="product-image-zoom-indicator" aria-hidden="true"><ZoomIn size={18}/></span>}</button><span>FEATURED</span></div>
      <div className="featured-product-copy" key={`copy-${product._id}`}><span className="featured-product-category">{product.category}</span><h3>{product.name}</h3><p>{product.description||"Explore this wholesale product from the store."}</p><div className="featured-product-details"><strong>{money.format(product.packetPrice)} <small>/ {perPiece?"piece":"bundle"}</small></strong><span>{pieces} {perPiece?"piece":"pieces / bundle"}</span><span>{product.stockPackets>0?`${product.stockPackets} ${unitName(product)}${product.stockPackets===1?"":"s"} available`:"Currently out of stock"}</span></div><button type="button" disabled={!product.stockPackets} onClick={()=>onAdd(product)}><Plus size={15}/> Add {perPiece?"piece":"bundle"}</button></div>
    </article>
    <div className="featured-product-controls" role="group" aria-label="Favorite product navigation"><button type="button" aria-label="Previous favorite product" onClick={()=>move(-1)} disabled={products.length<2}><ChevronLeft size={18}/></button><span aria-live="off">{visibleIndex+1} / {products.length}</span><button type="button" aria-label="Next favorite product" onClick={()=>move(1)} disabled={products.length<2}><ChevronRight size={18}/></button></div>
  </section>;
}

function ProductQuickView({product,onAdd,onClose}){
  const dialogRef=useRef(null);
  const perPiece=unitName(product)==="piece";
  const piecesPerUnit=perPiece?1:product.piecesPerBundle??product.piecesPerPacket;
  useEffect(()=>{
    const dialog=dialogRef.current;
    if(!dialog)return undefined;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    if(!dialog.open)dialog.showModal();
    return ()=>{
      document.body.style.overflow=previousOverflow;
      if(dialog.open)dialog.close();
    };
  },[product._id]);
  return <dialog ref={dialogRef} className="product-quick-view" aria-labelledby="product-quick-view-title" onCancel={event=>{event.preventDefault();onClose();}} onClick={event=>{if(event.target===event.currentTarget)onClose();}}>
    <button className="product-quick-view-close" type="button" aria-label="Close product details" onClick={onClose}><X size={20}/></button>
    <div className="product-quick-view-image"><ProductPhoto product={product} className="product-quick-view-photo" fallbackClass="product-quick-view-fallback" loading="eager"/></div>
    <section className="product-quick-view-details">
      <span className="store-eyebrow">{product.category}</span>
      <h2 id="product-quick-view-title">{product.name}</h2>
      <span className={`product-quick-view-stock${product.stockPackets>0?"":" out"}`}>{product.stockPackets>0?`${product.stockPackets} ${unitName(product)}${product.stockPackets===1?"":"s"} available`:"Currently out of stock"}</span>
      {product.description&&<p>{product.description}</p>}
      <strong className="product-quick-view-price">{money.format(product.packetPrice)} <small>/ {perPiece?"piece":"bundle"}</small></strong>
      <div className="product-quick-view-specs">
        {piecesPerUnit!=null&&<span><b>{piecesPerUnit}</b><small>{perPiece?"piece":"pieces per bundle"}</small></span>}
        <span><b>{formatWeight(weightPerItem(product))}</b><small>weight per {perPiece?"piece":"bundle"}</small></span>
      </div>
      <button className="primary product-quick-view-add" type="button" disabled={!product.stockPackets} onClick={()=>{onAdd(product);onClose();}}><Plus size={17}/>{product.stockPackets>0?"Add to cart":"Out of stock"}</button>
    </section>
  </dialog>;
}

function StorefrontPage({slug,catalogOnly}){
  const location=useLocation(),{storeBusiness}=useOutletContext(),navigate=useNavigate(),[business,setBusiness]=useState(null),[products,setProducts]=useState([]),[featuredProducts,setFeaturedProducts]=useState([]),[categories,setCategories]=useState([]),[category,setCategory]=useState(""),[searchDraft,setSearchDraft]=useState(null),[storeRetry,setStoreRetry]=useState(0),[productRetry,setProductRetry]=useState(0),[activeSlide,setActiveSlide]=useState(0),[sliderHovered,setSliderHovered]=useState(false),[sliderFocused,setSliderFocused]=useState(false),[cart,setCart]=useState([]),[cartOpen,setCartOpen]=useState(false),[checkoutAuthOpen,setCheckoutAuthOpen]=useState(false),[customerAccount,setCustomerAccount]=useState(null),[customerAccountError,setCustomerAccountError]=useState(""),[checkoutError,setCheckoutError]=useState(""),[checkoutBusy,setCheckoutBusy]=useState(false),[loadedSlug,setLoadedSlug]=useState(""),[error,setError]=useState("");
  const loading=loadedSlug!==slug;
  const [zoomedProduct,setZoomedProduct]=useState(null),[failedSlideImageUrl,setFailedSlideImageUrl]=useState("");
  const cartDialogRef=useRef(null);
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
    if(catalogOnly||!business||business.slug!==slug)return undefined;
    let active=true;
    api.get(`/stores/${encodeURIComponent(slug)}/products`,{params:{featuredOnly:true}})
      .then(({data})=>{if(active)setFeaturedProducts(data.products);})
      .catch(error=>{if(active){setFeaturedProducts([]);notify(getApiError(error),"error");}});
    return ()=>{active=false;};
  },[business,catalogOnly,slug]);
  useEffect(()=>{
    if(!new URLSearchParams(location.search).has("focusSearch"))return undefined;
    const frame=window.requestAnimationFrame(()=>document.querySelector(".customer-header .store-search input")?.focus({preventScroll:true}));
    return ()=>window.cancelAnimationFrame(frame);
  },[location.pathname,location.search,loading,products.length]);
  const slides=business?.sliderSlides||[];
  const safeActiveSlide=slides.length?activeSlide%slides.length:0;
  useEffect(()=>{
    if(slides.length<2||sliderHovered||sliderFocused)return undefined;
    if(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches)return undefined;
    const timer=window.setInterval(()=>setActiveSlide(current=>(current+1)%slides.length),6000);
    return ()=>window.clearInterval(timer);
  },[slides.length,safeActiveSlide,sliderFocused,sliderHovered]);
  const currentSlide=slides[safeActiveSlide];
  const slideImageFailed=!currentSlide?.imageUrl||failedSlideImageUrl===currentSlide.imageUrl;
  const visibleCategories=useMemo(()=>categories.slice(0,12),[categories]);
  const cartTotalWeightG=useMemo(()=>Number(cart.reduce((total,item)=>total+item.quantity*weightPerItem(item.product),0).toFixed(6)),[cart]);
  const cartSubtotalInr=useMemo(()=>cart.reduce((total,item)=>total+item.quantity*item.product.packetPrice,0),[cart]);
  const cartItemCount=cart.reduce((total,item)=>total+item.quantity,0);
  const catalogSections=useMemo(()=>groupCatalogProductsBySection(products,business?.storeSections||[]),[business?.storeSections,products]);
  const checkoutPhone=business?.contactPhone||business?.whatsappNumber||"";
  const checkoutCallHref=checkoutPhone?getStorePhoneHref(checkoutPhone):"";
  const checkoutWhatsapp=getStoreWhatsAppNumber(business?.whatsappNumber||business?.contactPhone);
  const checkoutWhatsappMessage=`Hi ${business?.name||"store"}, I am checking delivery charges before placing an order. Products subtotal: ${money.format(cartSubtotalInr)}; total weight: ${formatWeight(cartTotalWeightG)}${customerAccount?.pincode?`; PIN ${customerAccount.pincode}`:""}${customerAccount?.state?`, ${customerAccount.state}`:""}. Please confirm the delivery/payment process.`;
  const minimumOrderWeightG=Number(business?.minimumOrderWeightGrams)||1000;
  const remainingWeightG=Math.max(0,minimumOrderWeightG-cartTotalWeightG);
  const remainingUnits=estimateAdditionalUnits(cart,remainingWeightG);
  const minimumOrderValues={remainingUnits,unitLabel:remainingUnits===1?"unit":"units",remainingWeight:formatWeight(remainingWeightG),minimumWeight:formatWeight(minimumOrderWeightG)};
  const minimumOrderMessage=renderMinimumOrderText(
    business?.minimumOrderDisplayMode==="QUANTITY"
      ?business?.minimumOrderQuantityMessage||"Add at least {remainingUnits} more {unitLabel} to place your order (minimum {minimumWeight})."
      :business?.minimumOrderWeightMessage||"Add {remainingWeight} more to place your order (minimum {minimumWeight}).",
    minimumOrderValues
  );
  const productListStructuredData=useMemo(()=>{
    if(!business||!products.length)return "";
    const storeUrl=`https://xyronwebtech.com/wholesale/store/${encodeURIComponent(slug)}`;
    const items=products.slice(0,100).map((product,index)=>{
      const price=Number(product.packetPrice);
      const offer=Number.isFinite(price)&&price>=0?{
        "@type":"Offer",
        price:price.toFixed(2),
        priceCurrency:"INR",
        availability:`https://schema.org/${product.stockPackets>0?"InStock":"OutOfStock"}`,
        url:storeUrl
      }:undefined;
      return {
        "@type":"ListItem",
        position:index+1,
        item:{
          "@type":"Product",
          name:product.name,
          url:storeUrl,
          ...(product.description?{description:product.description}:{}),
          ...(product.category?{category:product.category}:{}),
          ...(product.imageUrl?{image:product.imageUrl}:{}),
          ...(offer?{offers:offer}:{})
        }
      };
    });
    return JSON.stringify({
      "@context":"https://schema.org",
      "@type":"ItemList",
      name:`${business.name} products`,
      numberOfItems:items.length,
      itemListElement:items
    }).replace(/</g,"\\u003c");
  },[business,products,slug]);
  useEffect(()=>{
    const dialog=cartDialogRef.current;
    if(!cartOpen||!dialog)return undefined;
    const previousOverflow=document.body.style.overflow;
    document.body.style.overflow="hidden";
    if(!dialog.open)dialog.showModal();
    return ()=>{
      document.body.style.overflow=previousOverflow;
      if(dialog.open)dialog.close();
    };
  },[cartOpen]);
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
    if(cartTotalWeightG<minimumOrderWeightG)return;
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
  if(loading)return <CustomerStorePage business={storeBusiness} slug={slug}><BrandLoader label={catalogOnly?"Loading products":"Loading this store"}/></CustomerStorePage>;
  if(error||!business)return <CustomerStorePage business={storeBusiness} slug={slug}><div className="store-error"><Store size={28}/><h1>We couldn’t open this store</h1><p>{error||"This store could not be found."}</p><button className="secondary-button" type="button" onClick={()=>{setError("");setLoadedSlug("");setStoreRetry(value=>value+1);}}>Retry opening store</button><Link className="wholesale-back-link" to="/"><ArrowRight size={14}/> Back to Xyron Wholesale</Link></div></CustomerStorePage>;

  return <div className={`customer-store${cart.length?" has-cart-dock":""}`}>
    {productListStructuredData&&<script type="application/ld+json" dangerouslySetInnerHTML={{__html:productListStructuredData}}/>}
    <CustomerStoreHeader business={business} slug={slug} categories={visibleCategories} onSelectCategory={chooseCategory}>
      <form className="store-search" onSubmit={submitSearch} role="search">
        <Search size={18}/><input aria-label="Search products in this store" placeholder={`Search products in ${business.name}`} value={searchText} onChange={event=>updateSearchText(event.target.value)}/><button type="submit">Search <Search size={15}/></button>
      </form>
      <div className="store-header-actions"><Link className="customer-account-link" to={`/store/${encodeURIComponent(slug)}/account`} aria-label={customerAccount?"Open your profile":"Sign in to your account"}><UserRound size={15}/><span>{customerAccount?"Profile":"Sign in"}</span></Link><StoreDashboardLink/><button className="store-cart-button" type="button" aria-label={`Cart, ${cartItemCount} items`} aria-expanded={cartOpen} aria-controls="store-cart" title="Cart" onClick={()=>setCartOpen(value=>!value)}><ShoppingCart size={16}/><b aria-hidden="true">{cartItemCount}</b></button></div>
    </CustomerStoreHeader>
    <nav className="store-nav" aria-label="Store categories">
      <button className={!category?"selected":""} onClick={()=>chooseCategory("")}><Boxes size={15}/> All products</button>
      {visibleCategories.slice(0,6).map(item=><button key={item} className={category===item?"selected":""} onClick={()=>chooseCategory(item)}>{item}</button>)}
      {visibleCategories.length>6&&<label className="store-more-categories">More categories <select aria-label="More product categories" value={category} onChange={event=>chooseCategory(event.target.value)}><option value="">All categories</option>{visibleCategories.slice(6).map(item=><option key={item} value={item}>{item}</option>)}</select></label>}
    </nav>

    <main className={`store-content ${catalogOnly?"store-products-page":""}`}>
      {!catalogOnly&&<div className="store-top-layout store-top-layout-full">
        <section
          className="store-slider"
          aria-roledescription="carousel"
          aria-label={`${business.name} store banners`}
          onMouseEnter={()=>setSliderHovered(true)}
          onMouseLeave={()=>setSliderHovered(false)}
          onFocusCapture={()=>setSliderFocused(true)}
          onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setSliderFocused(false);}}
        >
          {currentSlide?<div className={`store-slide${slideImageFailed?" store-slide-image-missing":""}`}>
            {!slideImageFailed&&<img key={currentSlide._id||`${slug}-${safeActiveSlide}`} className="store-slide-image" src={currentSlide.imageUrl} alt="" fetchPriority="high" decoding="async" onError={()=>setFailedSlideImageUrl(currentSlide.imageUrl)}/>}
            <div className="store-slide-copy" key={currentSlide._id||`${slug}-${safeActiveSlide}`}><span className="store-slide-tag">{business.category}</span><h1>{currentSlide.title}</h1>{currentSlide.subtitle&&<p>{currentSlide.subtitle}</p>}<a className="store-slide-button" href={currentSlide.buttonHref||"#products"}>{currentSlide.buttonLabel||"Explore products"} <ArrowRight size={16}/></a></div>
            {slides.length>1&&<div className="store-slide-controls" role="group" aria-label="Banner navigation">
              <div className="store-slide-control-buttons">
                <button type="button" onClick={()=>moveSlide(-1)} aria-label="Previous banner"><ChevronLeft size={17}/></button>
                <button type="button" onClick={()=>moveSlide(1)} aria-label="Next banner"><ChevronRight size={17}/></button>
              </div>
            </div>}
          </div>:<div className="store-slide store-slide-empty"><span className="store-slide-tag">{business.category}</span><h1>{business.name}</h1><p>{business.description||"Welcome to our wholesale store. Browse available products below."}</p><a className="store-slide-button" href="#products">Browse products <ArrowRight size={16}/></a><span className="empty-slider-note">Store banner images will appear here</span></div>}
        </section>
      </div>}

      <section className="products-section" id="products">
        <div className="products-heading"><div><span className="store-eyebrow">{catalogOnly?"PRODUCT CATALOGUE":`SHOP ${business.name.toUpperCase()}`}</span><h2>{query?`Results for “${query}”`:category|| (catalogOnly?"All products":"Products")}</h2><p>{products.length?`${products.length} product${products.length===1?"":"s"} shown${catalogOnly&&catalogSections.sections.length?` across ${catalogSections.sections.length} custom section${catalogSections.sections.length===1?"":"s"}${catalogSections.unassignedProducts.length?" and other products":""}`:""} from this store`:"Browse the products this business has added to its store."}</p></div><div className="products-heading-actions">{catalogOnly?<Link className="store-products-view-all" to={`/store/${encodeURIComponent(slug)}`} onClick={()=>{setCategory("");setSearchDraft(null);}}><ChevronLeft size={15}/> Back to store</Link>:<Link className="store-products-view-all" to={`/store/${encodeURIComponent(slug)}/products`} onClick={()=>{setCategory("");setSearchDraft(null);}}>View all products <ChevronRight size={15}/></Link>}<form className="products-inline-search" onSubmit={submitSearch}><Search size={16}/><input aria-label="Filter these products" placeholder="Search these products" value={searchText} onChange={event=>updateSearchText(event.target.value)}/><button type="submit">Search</button></form></div></div>
        {error&&<div className="store-inline-error" role="alert">{error}<button type="button" onClick={()=>setProductRetry(value=>value+1)}>Retry</button></div>}
        {catalogOnly&&catalogSections.sections.length>0?<div className="store-catalog-sections">
          {catalogSections.sections.map(({section,products:sectionProducts})=><section className="products-section custom-store-section store-catalog-section" key={section._id||section._key||section.title}><div className="products-heading"><div><span className="store-eyebrow">{business.name.toUpperCase()}</span><h2>{section.title}</h2>{section.subtitle&&<p>{section.subtitle}</p>}</div></div><div className="product-grid">{sectionProducts.map(product=><ProductCard key={product._id} product={product} onZoom={setZoomedProduct} onAdd={()=>addToCart(product)}/>)}</div></section>)}
          {catalogSections.unassignedProducts.length>0&&<section className="products-section custom-store-section store-catalog-section"><div className="products-heading"><div><span className="store-eyebrow">MORE TO EXPLORE</span><h2>Other products</h2><p>More items available from {business.name}.</p></div></div><div className="product-grid">{catalogSections.unassignedProducts.map(product=><ProductCard key={product._id} product={product} onZoom={setZoomedProduct} onAdd={()=>addToCart(product)}/>)}</div></section>}
        </div>:products.length?<div className="product-grid">{products.map(product=><ProductCard key={product._id} product={product} onZoom={setZoomedProduct} onAdd={()=>addToCart(product)}/>)}</div>:<div className="products-empty"><span><PackageSearch size={25}/></span><h3>{query||category?"No matching products":"This store is getting its catalogue ready"}</h3><p>{query||category?"Try another product name or choose a different category.":"Products added by this business will appear here. There are no sample products in this store."}</p>{query||category?<button onClick={()=>{clearSearch();setCategory("");}}>Show all products</button>:null}</div>}
      </section>
      {!catalogOnly&&!query&&!category&&featuredProducts.length>0&&<FeaturedProductCarousel products={featuredProducts} onZoom={setZoomedProduct} onAdd={addToCart}/>}
      {!catalogOnly&&!query&&!category&&(business.storeSections||[]).map(section=>{
        const sectionProducts=section.productIds.map(id=>products.find(product=>product._id===id)).filter(Boolean);
        return sectionProducts.length?<section className="products-section custom-store-section" key={section._id}><div className="products-heading"><div><span className="store-eyebrow">{business.name.toUpperCase()}</span><h2>{section.title}</h2>{section.subtitle&&<p>{section.subtitle}</p>}</div></div><div className="product-grid">{sectionProducts.map(product=><ProductCard key={product._id} product={product} onZoom={setZoomedProduct} onAdd={()=>addToCart(product)}/>)}</div></section>:null;
      })}
      {cartOpen&&<dialog ref={cartDialogRef} className="store-cart-dialog" id="store-cart" aria-labelledby="cart-title" onCancel={event=>{event.preventDefault();setCartOpen(false);}} onClick={event=>{if(event.target===event.currentTarget)setCartOpen(false);}}>
        <header className="store-cart-dialog-heading"><div><span className="store-eyebrow">ORDER REVIEW</span><h2 id="cart-title">Your cart</h2><p>{business.name} · minimum order {formatWeight(minimumOrderWeightG)}</p></div><button type="button" aria-label="Close order review" onClick={()=>setCartOpen(false)}><X size={20}/></button></header>
        {cart.length?<div className="store-cart-dialog-body">
          <section className="store-cart-dialog-summary" aria-label="Cart items and totals">
          <div className="cart-items">{cart.map(item=><article className="cart-item" key={item.product._id}>
            <div className="cart-item-image"><ProductPhoto product={item.product} className="cart-item-photo" fallbackClass="cart-item-image-fallback"/></div>
            <div className="cart-item-summary"><b>{item.product.name}</b><small>{item.product.category}</small><small>{money.format(item.product.packetPrice)} / {unitName(item.product)}</small><span className="cart-item-weight">{formatWeight(weightPerItem(item.product)*item.quantity)} · {item.quantity} {unitName(item.product)}{item.quantity===1?"":"s"}</span><div className="cart-item-controls">
              <button type="button" aria-label={`Decrease ${item.product.name}`} disabled={item.quantity<=1} onClick={()=>updateCartQuantity(item.product._id,item.quantity-1)}><Minus size={16}/></button>
              <span aria-label={`${item.product.name} quantity`}>{item.quantity}</span>
              <button type="button" aria-label={`Increase ${item.product.name}`} disabled={item.quantity>=item.product.stockPackets} onClick={()=>updateCartQuantity(item.product._id,item.quantity+1)}><Plus size={16}/></button>
              <button type="button" className="remove-cart-item" aria-label={`Remove ${item.product.name}`} onClick={()=>setCart(current=>current.filter(entry=>entry.product._id!==item.product._id))}><Trash2 size={14}/></button>
            </div></div>
            <b className="cart-item-total">{money.format(item.product.packetPrice*item.quantity)}</b>
          </article>)}</div>
          <div className="cart-total-weight"><span>Total cart weight</span><b>{formatWeight(cartTotalWeightG)}</b></div>
          <div className={`minimum-order-guidance ${cartTotalWeightG>=minimumOrderWeightG?"is-ready":""}`} role="status"><ShoppingCart size={17}/><span>{cartTotalWeightG>=minimumOrderWeightG?`Minimum reached · ${formatWeight(cartTotalWeightG)} in your cart.`:minimumOrderMessage}</span></div>
          <div className="cart-cost-row"><span>Products subtotal</span><b>{money.format(cartSubtotalInr)}</b></div>
          <div className="cart-delivery-summary"><b>Delivery charge</b><span>Calculated from your delivery PIN and total order weight when the order is placed. If no rate matches your area, your order can still be placed; wait for the store’s final bill before paying.</span>{(checkoutCallHref||checkoutWhatsapp)&&<div className="cart-delivery-contact"><span>Want to confirm the delivery charge first?</span>{checkoutCallHref&&<a href={checkoutCallHref}><Phone size={13}/> Call store</a>}{checkoutWhatsapp&&<a href={`https://wa.me/${checkoutWhatsapp}?text=${encodeURIComponent(checkoutWhatsappMessage)}`} target="_blank" rel="noreferrer"><MessageCircle size={13}/> WhatsApp</a>}</div>}</div>
          </section>
          <section className="store-cart-dialog-checkout" aria-label="Delivery and checkout">
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
            <p className="account-order-hint">Delivery is calculated automatically when you place the order.</p>
            <button className="primary" type="button" disabled={checkoutBusy||cartTotalWeightG<minimumOrderWeightG} onClick={()=>placeOrder()}>{checkoutBusy?"Placing order…":"Place order"}</button>
          </div>:<div className="cart-checkout-form customer-checkout-auth">
            <h3>Sign in to place your order</h3>
            <p className="account-order-hint">Sign in or create your account once. Your saved delivery details will be used for future orders.</p>
            {customerAccountError&&<div className="store-inline-error" role="alert">{customerAccountError}</div>}
            {checkoutError&&<div className="error" role="alert">{checkoutError}</div>}
            {checkoutAuthOpen?<CustomerAuthForm slug={slug} onAuthenticated={customerSignedIn}/>:<button className="primary" type="button" disabled={checkoutBusy||cartTotalWeightG<minimumOrderWeightG} onClick={()=>{setCheckoutError("");setCheckoutAuthOpen(true);}}>Place order</button>}
          </div>}
          </section>
        </div>:<div className="cart-empty"><ShoppingCart size={28}/><b>Your cart is empty</b><span>Add products from this store to get started.</span></div>}
      </dialog>}
    </main>
    <CustomerStoreFooter business={business}/>
    {cart.length>0&&<button className="store-cart-dock" type="button" aria-controls="store-cart" onClick={()=>setCartOpen(true)}>
      <span className="store-cart-dock-summary"><span className="store-cart-dock-icon"><ShoppingCart size={19}/><b>{cartItemCount}</b></span><span><strong>Your cart</strong><small>{cartItemCount} {cartItemCount===1?"item":"items"} · {formatWeight(cartTotalWeightG)}</small></span></span>
      <span className="store-cart-dock-action"><span>{money.format(cartSubtotalInr)}</span><span>Review cart <ArrowRight size={15}/></span></span>
    </button>}
    {zoomedProduct&&<ProductQuickView product={zoomedProduct} onAdd={addToCart} onClose={()=>setZoomedProduct(null)}/>}
  </div>;
}

export default function Storefront({catalogOnly=false}){
  const {slug}=useParams();
  return <StorefrontPage key={slug} slug={slug} catalogOnly={catalogOnly}/>;
}
