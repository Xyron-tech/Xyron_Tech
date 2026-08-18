import React, { useEffect } from "react";

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

import "./styles/section-headers.css";
import "./styles/typography.css";
import Team from "./Components/Team/Team/Team";

function App() {

  useEffect(() => {

    const cards = document.querySelectorAll(
      ".service-card, .Pricing-card, .about-card"
    );

    const observer = new IntersectionObserver(
      (entries) => {

        entries.forEach((entry) => {

          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          }

        });

      },
      {
        threshold: 0.18,
      }
    );

    cards.forEach((card) => {
      observer.observe(card);
    });

    return () => {
      observer.disconnect();
    };

  }, []);

  return (
    <div>

      <SEO path="/" />

      <Navbar />

      <Home />

      <Services />
      <About />
      <HowWeWork />

      <Projects />

      {/* <Team /> */}

      <Contact />

      <Footer />

      <WhatsAppFloat />

    </div>
  );
}

export default App;