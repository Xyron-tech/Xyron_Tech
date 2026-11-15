import {lazy,Suspense,useEffect} from "react";
import {BrowserRouter,Navigate,Route,Routes,useLocation} from "react-router-dom";
import SEO from "./Components/SEO/SEO";
import Navbar from "./Components/Navbar/Navbar";
import Home from "./Components/Home/Home";
import About from "./Components/About/About";
import Services from "./Components/Services/Services";
import Projects from "./Components/Projects/Projects";
import Contact from "./Components/Contact/Contact";
import Footer from "./Components/Footer/Footer";
import HowWeWork from "./Components/HowWeWork/HowWeWork";
import WhatsAppFloat from "./Components/WhatsAppFloat/WhatsAppFloat";
import Testimonials from "./Components/Testimonials/Testimonials";
import "./styles/section-headers.css";
import "./styles/typography.css";

const WholesaleExperience=lazy(()=>import("./WholesaleExperience.jsx"));

function PortfolioHome(){
  return <><Home/><About/><Services/><Testimonials/><Contact/></>;
}

function PortfolioRoutes(){
  const {pathname,hash}=useLocation();
  useEffect(()=>{
    if(hash){
      requestAnimationFrame(()=>document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({behavior:"smooth",block:"start"}));
    }else window.scrollTo(0,0);
  },[hash,pathname]);

  const pageMetadata={
    "/":{
      title:"Xyron WebTech | Digital Solutions",
      description:"Xyron WebTech creates responsive business websites, e-commerce stores, mobile apps, and digital experiences for brands across India.",
      keywords:"Xyron WebTech, website development India, responsive web design, e-commerce websites, mobile app development"
    },
    "/projects":{
      title:"Website Projects | Xyron WebTech",
      description:"Explore websites and digital products designed and developed by Xyron WebTech for businesses, brands, and creators.",
      keywords:"Xyron WebTech projects, website portfolio, business website examples, e-commerce projects, web design portfolio"
    },
    "/services":{
      title:"Web Design & Development Services | Xyron WebTech",
      description:"Explore Xyron WebTech services including responsive websites, e-commerce development, mobile apps, maintenance, and redesign.",
      keywords:"web development services, website design, e-commerce development, mobile app development, website maintenance, website redesign"
    },
    "/how-it-works":{
      title:"How We Work | Xyron WebTech",
      description:"Learn how Xyron WebTech takes projects from consultation and planning through design, development, review, and launch.",
      keywords:"Xyron WebTech process, website project workflow, web design process, website development steps"
    },
    "/contact":{
      title:"Contact Xyron WebTech | Start a Website Project",
      description:"Contact Xyron WebTech to discuss a business website, online store, mobile app, or other digital project.",
      keywords:"contact Xyron WebTech, website development quote, web design consultation, website project enquiry"
    }
  };
  const metadata=pageMetadata[pathname]||pageMetadata["/"];

  return <>
    <SEO path={pathname} {...metadata}/>
    <Navbar/>
    <Routes>
      <Route path="/" element={<PortfolioHome/>}/>
      <Route path="/projects" element={<Projects/>}/>
      <Route path="/services" element={<Services showAll/>}/>
      <Route path="/how-it-works" element={<HowWeWork/>}/>
      <Route path="/contact" element={<Contact/>}/>
      <Route path="*" element={<Navigate to="/" replace/>}/>
    </Routes>
    <Footer/>
    <WhatsAppFloat/>
  </>;
}

export default function App(){
  const isWholesale=window.location.pathname==="/wholesale"||window.location.pathname.startsWith("/wholesale/");
  if(isWholesale)return <Suspense fallback={<div className="loading">Loading Xyron Wholesale…</div>}><WholesaleExperience/></Suspense>;
  return <BrowserRouter><PortfolioRoutes/></BrowserRouter>;
}
