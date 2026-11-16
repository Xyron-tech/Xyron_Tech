import {useEffect,useRef,useState} from "react";
import {Link,useLocation,useNavigate} from "react-router-dom";
import "./Navbar.css";
import logo from "../../assets/logo.webp";
import {FiChevronDown,FiCode,FiGrid,FiHome,FiMail,FiMenu,FiMessageSquare,FiShoppingBag,FiX} from "react-icons/fi";

const workItems=[
  {label:"Projects",to:"/projects"},
  {label:"How it works",to:"/#how-we-work",section:"how-we-work"},
  {label:"Plans",to:"/#pricing",section:"pricing"},
  {label:"Wholesale",href:"/wholesale/register"}
];

const whatsappLink="https://wa.me/919626782279?text=Hello%20Xyron%20Web%20Tech,%20I'm%20interested%20in%20your%20web%20development%20services.";

export default function Navbar(){
  const [menuOpen,setMenuOpen]=useState(false);
  const [openGroup,setOpenGroup]=useState(false);
  const [activeSection,setActiveSection]=useState("home");
  const navRef=useRef(null);
  const navigate=useNavigate();
  const {pathname,hash}=useLocation();

  const closeMenu=()=>{setOpenGroup(false);setMenuOpen(false);};
  const scrollToSection=id=>{
    closeMenu();
    if(pathname!=="/"){navigate(`/#${id}`);return;}
    if(hash!==`#${id}`) navigate(`/#${id}`,{replace:true});
    requestAnimationFrame(()=>document.getElementById(id)?.scrollIntoView({behavior:"smooth",block:"start"}));
  };

  useEffect(()=>{
    const handleScroll=()=>{
      if(pathname!=="/"){
        const routeSections={"/contact":"contact","/projects":"projects","/services":"services","/how-it-works":"how-it-works"};
        setActiveSection(routeSections[pathname]||"home");
        return;
      }
      let current="home";
      ["home","about","services","testimonials","contact"].forEach(id=>{
        const section=document.getElementById(id);
        if(section&&section.getBoundingClientRect().top<=150)current=id;
      });
      setActiveSection(current);
    };
    window.addEventListener("scroll",handleScroll,{passive:true});
    handleScroll();
    return ()=>window.removeEventListener("scroll",handleScroll);
  },[pathname]);

  useEffect(()=>{
    const handlePointerDown=event=>{
      if(navRef.current&&!navRef.current.contains(event.target))setOpenGroup(false);
    };
    const handleKeyDown=event=>{if(event.key==="Escape")closeMenu();};
    document.addEventListener("pointerdown",handlePointerDown);
    document.addEventListener("keydown",handleKeyDown);
    return ()=>{
      document.removeEventListener("pointerdown",handlePointerDown);
      document.removeEventListener("keydown",handleKeyDown);
    };
  },[]);

  useEffect(()=>{
    document.body.style.overflow=menuOpen?"hidden":"";
    return ()=>{document.body.style.overflow="";};
  },[menuOpen]);

  const renderWorkMenu=(mobile=false)=><div className={`${mobile?"mobile-nav-group":"nav-dropdown"} ${openGroup?"open":""}`} key={mobile?"mobile-work":"work"}>
    <button type="button" className={`nav-group-trigger ${["projects","how-it-works"].includes(activeSection)?"active":""}`} aria-expanded={openGroup} aria-controls={mobile?"mobile-work-submenu":"work-submenu"} onClick={()=>setOpenGroup(value=>!value)}>
      {mobile&&<FiGrid aria-hidden="true"/>}Our Work<FiChevronDown aria-hidden="true"/>
    </button>
    <div id={mobile?"mobile-work-submenu":"work-submenu"} className="nav-submenu" aria-hidden={!openGroup}>
      {workItems.map(item=>item.href
        ?<a href={item.href} key={item.label} onClick={closeMenu}><FiShoppingBag aria-hidden="true"/>{item.label}</a>
        :<Link to={item.to} key={item.label} onClick={event=>{closeMenu();if(item.section&&pathname==="/"){event.preventDefault();scrollToSection(item.section);}}}>{item.label}</Link>)}
    </div>
  </div>;

  return <header className="navbar" ref={navRef}>
    <Link className="nav-logo" to="/" aria-label="Xyron WebTech home" onClick={closeMenu}>
      <img src={logo} alt="Xyron WebTech logo"/>
      <span className="nav-brand"><span>Xyron</span>WebTech</span>
    </Link>

    <nav className="nav-menu" aria-label="Main navigation">
      <button type="button" className={activeSection==="home"?"active":""} onClick={()=>scrollToSection("home")}><FiHome aria-hidden="true"/>Home</button>
      <button type="button" className={activeSection==="about"?"active":""} onClick={()=>scrollToSection("about")}>About</button>
      <Link to="/services" className={activeSection==="services"?"active":""}><FiCode aria-hidden="true"/>Services</Link>
      <button type="button" className={activeSection==="testimonials"?"active":""} onClick={()=>scrollToSection("testimonials")}><FiMessageSquare aria-hidden="true"/>Testimonials</button>
      {renderWorkMenu()}
      <Link className={activeSection==="contact"?"active":""} to="/contact"> <FiMail aria-hidden="true"/>Contact</Link>
    </nav>

    <div className="nav-actions"><Link className="nav-btn" to="/contact">Get in Touch</Link></div>
    <button className="menu-toggle" type="button" aria-label={menuOpen?"Close navigation menu":"Open navigation menu"} aria-expanded={menuOpen} aria-controls="mobile-navigation" onClick={()=>{setMenuOpen(value=>!value);setOpenGroup(false);}}>
      {menuOpen?<FiX/>:<FiMenu/>}
    </button>

    <div className={`mobile-overlay ${menuOpen?"active":""}`} aria-hidden="true" onClick={closeMenu}/>
    <div id="mobile-navigation" className={`mobile-menu ${menuOpen?"active":""}`} aria-label="Mobile navigation" aria-hidden={!menuOpen}>
      <div className="mobile-menu-header"><div className="mobile-menu-brand"><span className="mobile-menu-subtitle">XyronWebTech</span></div><button className="mobile-close" onClick={closeMenu} aria-label="Close menu" type="button"><FiX/></button></div>
      <nav className="mobile-nav-links" aria-label="Mobile main navigation">
        <button type="button" className={activeSection==="home"?"active":""} onClick={()=>scrollToSection("home")}><FiHome aria-hidden="true"/>Home</button>
        <button type="button" className={activeSection==="about"?"active":""} onClick={()=>scrollToSection("about")}>About</button>
        <Link to="/services" className={activeSection==="services"?"active":""} onClick={closeMenu}><FiCode aria-hidden="true"/>Services</Link>
        <button type="button" className={activeSection==="testimonials"?"active":""} onClick={()=>scrollToSection("testimonials")}><FiMessageSquare aria-hidden="true"/>Testimonials</button>
        {renderWorkMenu(true)}
        <Link to="/contact" onClick={closeMenu}><FiMail aria-hidden="true"/>Contact</Link>
      </nav>
      <div className="mobile-menu-footer"><Link className="mobile-btn" to="/contact" onClick={closeMenu}>Get in Touch</Link><a className="mobile-whatsapp-link" href={whatsappLink} target="_blank" rel="noreferrer">Chat on WhatsApp</a></div>
    </div>
  </header>;
}
