
import React from "react";
import "./Footer.css";
import logo from "../../assets/logo.webp";

import {
  FaYoutube,
  FaInstagram,
  FaArrowRight,
} from "react-icons/fa";

import {
  FiMail,
  FiPhone,
  FiMapPin,
} from "react-icons/fi";


// ======================================================
// QUICK LINKS
// ======================================================

const quickLinks = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Services", href: "#services" },
  { name: "Projects", href: "#projects" },
  { name: "How We Work", href: "#how-we-work" },
  { name: "Contact", href: "#contact" },
];


// ======================================================
// CONTACT INFORMATION
// ======================================================

const contactInfo = [
  {
    icon: <FiMail />,
    title: "Email",
    value: "xyronwebtechnology@gmail.com",
    href: "mailto:xyronwebtechnology@gmail.com",
  },
  {
    icon: <FiPhone />,
    title: "Phone",
    value: "+91 96267 82279",
    href: "tel:+919626782279",
  },
  {
    icon: <FiMapPin />,
    title: "Location",
    value: "Chennai, Tamil Nadu",
    href: "https://maps.google.com",
  },
];


// ======================================================
// FOOTER COMPONENT
// ======================================================

const Footer = () => {
  return (
    <footer className="footer">

      <div className="footer-container">


        {/* ==================================================
            BRAND SECTION
        ================================================== */}

        <div className="footer-brand">

          <div className="footer-logo">

            <img
              src={logo}
              alt="XyronTech Logo"
            />

            <h2>
              <span>Xyron</span>WebTech
            </h2>

          </div>


          <p className="footer-description">
            Building modern digital solutions for startups,
            businesses and creators with premium web
            experiences that leave a lasting impression.
          </p>


          {/* SOCIAL MEDIA */}

          <div className="footer-social">

            <a
              href="https://youtube.com/@xyron_tech?si=TxNLumDpZEFMBmAY"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="XyronTech YouTube"
            >
              <FaYoutube />
            </a>


            <a
              href="https://www.instagram.com/xyronwebtech.websites?igsh=NDU1aXd0anM1dGdx"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="XyronTech Instagram"
            >
              <FaInstagram />
            </a>

          </div>

        </div>



        {/* ==================================================
            QUICK LINKS
        ================================================== */}

        <div className="footer-column">

          <h3>
            Quick Links
          </h3>


          <ul>

            {quickLinks.map((item, index) => (

              <li key={index}>

                <a href={item.href}>

                  <FaArrowRight />

                  <span>
                    {item.name}
                  </span>

                </a>

              </li>

            ))}

          </ul>

        </div>



        {/* ==================================================
            CONTACT US
        ================================================== */}

        <div className="footer-column footer-contact-column">

          <h3>
            Contact Us
          </h3>


          <div className="footer-contact-list">

            {contactInfo.map((item, index) => (

              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-contact-item"
              >

                <div className="footer-contact-icon">
                  {item.icon}
                </div>


                <div className="footer-contact-text">

                  <span>
                    {item.title}
                  </span>

                  <p>
                    {item.value}
                  </p>

                </div>

              </a>

            ))}

          </div>

        </div>

      </div>



      {/* ==================================================
          FOOTER BOTTOM
      ================================================== */}

      <div className="footer-bottom">

        <div className="footer-bottom-line"></div>


        <p>
          © 2026 <strong>XyronTech</strong>. All Rights Reserved.
        </p>


        <span>
          Crafted with ❤️ using React.
        </span>

      </div>

    </footer>
  );
};


export default Footer;

