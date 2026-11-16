import {useEffect} from "react";

const siteUrl="https://xyronwebtech.com";
const wholesaleUrl=`${siteUrl}/wholesale`;
const defaultTitle="Xyron Wholesale | Affordable Wholesale Management from ₹199/month";
const defaultDescription="Launch and manage your own wholesale store with Xyron WebTech Wholesale. Manage products, orders, customers, and payments with plans starting at ₹199 per month.";
const keywords="Xyron Wholesale, wholesale management software, wholesale store management, affordable wholesale software, wholesale ecommerce India";
const logoUrl=`${siteUrl}/logo.webp`;

function pageTitle(path){
  if(/^\/store\/[^/]+\/orders\/[^/]+$/.test(path))return "Order details";
  if(/^\/store\/[^/]+\/orders$/.test(path))return "Order history";
  if(/^\/store\/[^/]+\/account$/.test(path))return "Customer account";
  if(path.startsWith("/store/"))return "Wholesale store";
  if(path==="/login")return "Sign in";
  if(path==="/register")return "Business registration";
  if(path==="/pending")return "Application status";
  if(path==="/dashboard/analytics")return "Order analytics";
  if(path==="/dashboard/orders")return "Order management";
  if(path==="/dashboard/profile"||path==="/dashboard/storefront")return "Store profile";
  if(path==="/dashboard/shipping")return "Shipping management";
  if(path==="/dashboard/payments")return "Payment settings";
  if(path.startsWith("/dashboard/upgrade"))return "Plans and upgrades";
  if(path.startsWith("/dashboard/support"))return "Business support";
  if(path.startsWith("/dashboard"))return "Product management";
  if(path.startsWith("/super-admin/testimonials"))return "Testimonial management";
  if(path.startsWith("/super-admin/support"))return "Platform inbox";
  if(path.startsWith("/super-admin"))return "Business applications";
  return "Business workspace";
}

export default function WholesaleSEO({path="/",business,mode="public"}){
  const isStore=mode==="store"&&Boolean(business);
  const isAdmin=mode==="admin";
  const isStorePrivate=/^\/store\/[^/]+\/(account|orders)(\/|$)/.test(path);
  const title=isAdmin
    ?`${pageTitle(path)} | ${business?.name||"Xyron"} | Xyron Wholesale`
    :isStore
      ?isStorePrivate
        ?`${pageTitle(path)} | ${business.name} | Xyron Wholesale`
        :business.seoTitle||`${business.name} | ${business.category||"Wholesale"} Store`
      :path==="/"
        ?defaultTitle
        :path==="/register"
          ?"Create your wholesale store | Xyron Wholesale"
          :path==="/login"
            ?"Sign in | Xyron Wholesale"
            :`Xyron Wholesale | ${pageTitle(path)}`;
  const description=isAdmin
    ?`${pageTitle(path)} for ${business?.name||"your business"} in the Xyron Wholesale business workspace.`
    :isStore
      ?isStorePrivate
        ?`Secure ${pageTitle(path).toLowerCase()} access for ${business.name} on Xyron Wholesale.`
        :business.seoDescription||business.description||`${business.name} wholesale store. Browse products and place orders directly with this business.`
      :path==="/register"
        ?"Apply to create an independent wholesale storefront with Xyron Wholesale. Choose a plan and submit your business details for review."
        :path==="/login"
          ?"Sign in to your Xyron Wholesale account to manage your business workspace or customer orders."
          :path==="/pending"
            ?"Check the review status of your Xyron Wholesale business application."
            :path==="/dashboard/orders"
              ?"Review orders, prepare delivery bills, and verify customer payments in your Xyron Wholesale dashboard."
              :path==="/dashboard/analytics"
                ?"View daily, weekly, and monthly sales, order totals, and verified payments for your wholesale business."
                :path.startsWith("/dashboard")
                  ?"Manage products, storefront settings, payments, and delivery regions in your Xyron Wholesale dashboard."
                  :path.startsWith("/super-admin")
                    ?"Manage Xyron Wholesale businesses, platform support, and account approvals."
                    :defaultDescription;
  const canonicalUrl=path==="/"?`${wholesaleUrl}/`:`${wholesaleUrl}${path}`;
  const image=isStore&&business.logoUrl?business.logoUrl:logoUrl;
  const privatePath=isAdmin||path==="/login"||path==="/register"||path.includes("/account")||path.includes("/orders");
  const structuredData=!isStore&&!isAdmin&&path==="/"?{
    "@context":"https://schema.org",
    "@type":"SoftwareApplication",
    name:"Xyron Wholesale",
    applicationCategory:"BusinessApplication",
    operatingSystem:"Web",
    url:`${wholesaleUrl}/`,
    description:defaultDescription,
    offers:{"@type":"Offer",price:"199",priceCurrency:"INR",description:"Plans starting at ₹199 per month"}
  }:null;

  const pageKeywords=isStore
    ?`${business.name}, ${business.category||"wholesale"}, wholesale store, Xyron Wholesale`
    :isAdmin
      ?`${pageTitle(path)}, ${business?.name||"business"} dashboard, Xyron Wholesale`
      :path==="/"
        ?keywords
      :path==="/register"
        ?"wholesale business registration, create wholesale store, Xyron Wholesale"
        :path==="/login"
          ?"Xyron Wholesale sign in, wholesale account login"
          :path==="/dashboard/orders"
            ?"wholesale order management, payment verification, Xyron Wholesale"
            :path==="/dashboard/analytics"
              ?"wholesale sales analytics, order reports, Xyron Wholesale"
              :path.startsWith("/store/")
                ?`${pageTitle(path)}, customer orders, ${keywords}`
                :`${pageTitle(path)}, ${keywords}`;
  const robots=privatePath?"noindex, nofollow":"index, follow";
  const serializedSchema=structuredData?JSON.stringify(structuredData).replace(/</g,"\\u003c"):"";

  useEffect(()=>{
    document.documentElement.lang="en-IN";
    document.title=title;
    const setMeta=(attribute,value,content)=>{
      let element=document.head.querySelector(`meta[${attribute}="${value}"]`);
      if(!element){element=document.createElement("meta");element.setAttribute(attribute,value);document.head.append(element);}
      element.setAttribute("content",content);
    };
    setMeta("name","description",description);
    setMeta("name","keywords",pageKeywords);
    setMeta("name","robots",robots);
    setMeta("name","twitter:card","summary_large_image");
    setMeta("name","twitter:title",title);
    setMeta("name","twitter:description",description);
    setMeta("name","twitter:image",image);
    setMeta("name","twitter:image:alt",isStore?`${business.name} store logo`:"Xyron Wholesale");
    setMeta("name","author","Xyron WebTech");
    setMeta("name","googlebot",robots);
    setMeta("property","og:type","website");
    setMeta("property","og:site_name","Xyron Wholesale");
    setMeta("property","og:title",title);
    setMeta("property","og:description",description);
    setMeta("property","og:url",canonicalUrl);
    setMeta("property","og:image",image);
    setMeta("property","og:image:alt",isStore?`${business.name} store logo`:"Xyron Wholesale");
    setMeta("property","og:locale","en_IN");
    let canonical=document.head.querySelector('link[rel="canonical"]');
    if(!canonical){canonical=document.createElement("link");canonical.rel="canonical";document.head.append(canonical);}
    canonical.href=canonicalUrl;
    let schema=document.head.querySelector('script[data-wholesale-seo-schema]')||document.head.querySelector('script[type="application/ld+json"]');
    if(serializedSchema){
      if(!schema){schema=document.createElement("script");schema.type="application/ld+json";document.head.append(schema);}
      schema.dataset.wholesaleSeoSchema="true";
      schema.textContent=serializedSchema;
    }else if(schema){
      schema.remove();
    }
  },[title,description,pageKeywords,robots,image,canonicalUrl,serializedSchema,isStore,business?.name]);

  return null;
}
