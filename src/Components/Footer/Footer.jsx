import {Link} from "react-router-dom";
import "./Footer.css";
import logo from "../../assets/logo.webp";
import {FaYoutube,FaInstagram,FaLinkedinIn,FaFacebookF,FaArrowRight} from "react-icons/fa";
import {FiMail,FiPhone,FiMapPin} from "react-icons/fi";

const footerNavigation=[
  {title:"About Us",links:[{name:"Our Vision",to:"/#our-vision"},{name:"Our Mission",to:"/#our-mission"},{name:"Our Values",to:"/#our-values"}]},
  {title:"Services",links:[{name:"Explore services",to:"/services"},{name:"Contact for a service",to:"/contact"}]},
  {title:"Our Work",links:[{name:"Projects",to:"/projects"},{name:"How it works",to:"/#how-we-work"},{name:"Plans",to:"/#pricing"},{name:"Testimonials",to:"/#testimonials"},{name:"Wholesale",href:"/wholesale/register"}]}
];

const contactInfo=[
  {icon:<FiMail/>,title:"Email",value:"xyronwebtechnology@gmail.com",href:"mailto:xyronwebtechnology@gmail.com"},
  {icon:<FiPhone/>,title:"Phone",value:"+91 96267 82279",href:"tel:+919626782279"},
  {icon:<FiMapPin/>,title:"Location",value:"Chennai, Tamil Nadu",href:"https://maps.google.com"}
];

export default function Footer(){
  return <footer className="footer">
    <div className="footer-container">
      <div className="footer-brand">
        <Link className="footer-logo" to="/" aria-label="Xyron WebTech home"><img src={logo} alt=""/><p className="footer-brand-name"><span>Xyron</span>WebTech</p></Link>
        <p className="footer-description">Xyron Web Tech builds modern, responsive and SEO-friendly websites for startups, businesses and creators — premium digital experiences that leave a lasting impression.</p>
        <div className="footer-social">
          <a href="https://youtube.com/@xyron_tech?si=TxNLumDpZEFMBmAY" target="_blank" rel="noopener noreferrer" aria-label="XyronTech YouTube"><FaYoutube/></a>
          <a href="https://www.instagram.com/xyronwebtech.websites?igsh=NDU1aXd0anM1dGdx" target="_blank" rel="noopener noreferrer" aria-label="XyronTech Instagram"><FaInstagram/></a>
          <a href="https://www.linkedin.com/in/xyron-web-tech-13b306425/" target="_blank" rel="noopener noreferrer" aria-label="Xyron Web Tech LinkedIn"><FaLinkedinIn/></a>
          <a href="https://www.facebook.com/xyronwebtech/" target="_blank" rel="noopener noreferrer" aria-label="Xyron Web Tech Facebook"><FaFacebookF/></a>
        </div>
      </div>

      {footerNavigation.map(group=><nav className="footer-column footer-nav-column" aria-label={group.title} key={group.title}>
        <h3>{group.title}</h3>
        <ul>{group.links.map(item=><li key={item.name}>{item.href
          ?<a href={item.href}><FaArrowRight aria-hidden="true"/><span>{item.name}</span></a>
          :<Link to={item.to}><FaArrowRight aria-hidden="true"/><span>{item.name}</span></Link>}</li>)}</ul>
      </nav>)}

      <div className="footer-column footer-contact-column">
        <h3>Contact Us</h3>
        <div className="footer-contact-list">{contactInfo.map(item=><a key={item.title} href={item.href} target={item.href.startsWith("https:")?"_blank":undefined} rel={item.href.startsWith("https:")?"noopener noreferrer":undefined} className="footer-contact-item">
          <div className="footer-contact-icon">{item.icon}</div><div className="footer-contact-text"><span>{item.title}</span><p>{item.value}</p></div>
        </a>)}</div>
      </div>
    </div>
    <div className="footer-bottom"><div className="footer-bottom-line"/><p>© {new Date().getFullYear()} <strong>XyronTech</strong>. All Rights Reserved.</p><span>Crafted with ❤️ using React.</span></div>
  </footer>;
}
