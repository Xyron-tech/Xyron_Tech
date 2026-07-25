import React, { useState, useEffect } from "react";
import "./Navbar.css";
import logo from "../../assets/logo.webp";

import {
  FiMenu,
  FiX,
} from "react-icons/fi";

const menuItems = [
  { name: "Home", id: "home" },
  { name: "About", id: "about" },
  { name: "Services", id: "services" },
   { name: "How We Work", id: "how-we-work" },
  { name: "Projects", id: "projects" },
  { name: "Contact", id: "contact" }
  
];

const whatsappLink =
  "https://wa.me/919626782279?text=Hello%20XyronTech,%20I'm%20interested%20in%20your%20web%20development%20services.";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      menuItems.forEach((item) => {
        const section = document.getElementById(item.id);
        if (!section) return;

        const top = section.offsetTop - 120;
        const height = section.offsetHeight;

        if (window.scrollY >= top && window.scrollY < top + height) {
          setActiveSection(item.id);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header className="navbar">
      <div className="nav-logo" onClick={() => scrollToSection("home")}>
        <img src={logo} alt="XyronTech Logo" />
        <h2>
          <span>Xyron</span>WebTech
        </h2>
      </div>

      <ul className="nav-menu">
        {menuItems.map((item) => (
          <li
            key={item.id}
            className={activeSection === item.id ? "active" : ""}
            onClick={() => scrollToSection(item.id)}
          >
            {item.name}
          </li>
        ))}
      </ul>

      <div className="nav-actions">
        <button
          className="nav-btn"
          onClick={() => window.open(whatsappLink, "_blank")}
        >
          Get in Touch
        </button>
      </div>

      <div className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
        {menuOpen ? <FiX /> : <FiMenu />}
      </div>

      <div
        className={`mobile-overlay ${menuOpen ? "active" : ""}`}
        onClick={() => setMenuOpen(false)}
      />

      <div className={`mobile-menu ${menuOpen ? "active" : ""}`}>
        <div className="mobile-menu-header">
          <div className="mobile-menu-brand">
            <span className="mobile-menu-title">Navigation</span>
            <span className="mobile-menu-subtitle">XyronWebTech</span>
          </div>
          <button
            className="mobile-close"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
            type="button"
          >
            <FiX />
          </button>
        </div>

        <nav className="mobile-nav-links">
          {menuItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={activeSection === item.id ? "active" : ""}
              onClick={() => scrollToSection(item.id)}
            >
              {item.name}
            </button>
          ))}
        </nav>

        <div className="mobile-menu-footer">
          <button
            type="button"
            className="mobile-btn"
            onClick={() => window.open(whatsappLink, "_blank")}
          >
            Get in Touch    
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
