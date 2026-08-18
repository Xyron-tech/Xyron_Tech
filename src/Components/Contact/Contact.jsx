import React, { useState } from "react";
import "./Contact.css";
import {
  FiPhone,
  FiMail,
  FiMapPin,
  FiSend,
} from "react-icons/fi";

import {
  FaWhatsapp,
  FaYoutube,
  FaInstagram,
} from "react-icons/fa";

const contactInfo = [
  {
    icon: <FiPhone />,
    title: "Call Us",
    value: "+91 99944 72896 / +91 96267 82279",
    link: "tel:+919994472896",
  },
  {
    icon: <FaWhatsapp />,
    title: "WhatsApp",
    value: "+91 98433 36980 / +91 99944 72896",
    link: "https://wa.me/919994472896",
  },
  {
    icon: <FiMail />,
    title: "Email",
    value: "xyronwebtechnology@gmail.com",
    link: "mailto:xyronwebtechnology@gmail.com",
  },
  {
    icon: <FiMapPin />,
    title: "Location",
    value: "Tamil Nadu, India",
    link: "https://maps.google.com",
  },
];

const services = [
  "Business Website",
  "E-Commerce",
  "Portfolio Website",
  "Web Application",
  "Landing Page",
  "App Development",
  "Social Media Growth",
  "Video Editing",
  "Other",
];

const Contact = () => {
  const [selectedService, setSelectedService] = useState("");
  const [customService, setCustomService] = useState("");

  return (
    <section className="contact-section" id="contact">

      {/* =====================================================
          SECTION HEADER
      ===================================================== */}

      <div className="contact-header section-header">

        <span className="contact-eyebrow">
          LET'S CONNECT
        </span>

        <h2 className="section-title">
          Contact Xyron Web Tech
        </h2>

        <p className="section-subtitle">
          Ready to build your website with XyronWebTech? Reach out to our team
          at xyronwebtech.com — we'd love to discuss your project and goals.
        </p>

        <span
          className="section-accent"
          aria-hidden="true"
        />

      </div>


      {/* =====================================================
          FORM
          FORM IS CENTERED AND FULL WIDTH
      ===================================================== */}

      <div className="contact-form-wrapper">

        <div className="contact-form-card">

          <div className="form-header">

            <span className="contact-eyebrow">
              START A PROJECT
            </span>

            <h3 className="contact-form-title">
              Tell Us About Your Project
            </h3>

            <p>
              Share your requirements with us and our team
              will get back to you as soon as possible.
            </p>

          </div>


          <form
            className="contact-form"
            action="https://api.web3forms.com/submit"
            method="POST"
          >

            {/* =========================
                WEB3FORMS
            ========================== */}

            <input
              type="hidden"
              name="access_key"
              value="ab88426e-b8dd-44a7-bd8a-2ef172ce7acf"
            />

            <input
              type="hidden"
              name="subject"
              value="New Enquiry from Xyron Tech Website"
            />

            <input
              type="hidden"
              name="from_name"
              value="Xyron Tech Contact Form"
            />

            <input
              type="checkbox"
              name="botcheck"
              style={{ display: "none" }}
            />


            {/* SELECTED SERVICE */}

            <input
              type="hidden"
              name="service"
              value={
                selectedService === "Other"
                  ? customService
                  : selectedService
              }
            />


            {/* =========================
                NAME + EMAIL
            ========================== */}

            <div className="input-row">

              <div className="form-field">

                <label htmlFor="name">
                  Your Name
                </label>

                <input
                  id="name"
                  type="text"
                  name="name"
                  placeholder="Enter your name"
                  required
                />

              </div>


              <div className="form-field">

                <label htmlFor="email">
                  Email Address
                </label>

                <input
                  id="email"
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  required
                />

              </div>

            </div>


            {/* =========================
                SERVICE + OTHER
            ========================== */}

            <div
              className={`input-row ${
                selectedService === "Other"
                  ? "service-other-row"
                  : ""
              }`}
            >

              <div className="form-field">

                <label htmlFor="service">
                  Select Service
                </label>

                <select
                  id="service"
                  value={selectedService}
                  onChange={(e) =>
                    setSelectedService(e.target.value)
                  }
                  required
                >

                  <option value="">
                    Select a service
                  </option>

                  {services.map((service) => (
                    <option
                      key={service}
                      value={service}
                    >
                      {service}
                    </option>
                  ))}

                </select>

              </div>


              {selectedService === "Other" && (

                <div className="form-field">

                  <label htmlFor="customService">
                    Your Service
                  </label>

                  <input
                    id="customService"
                    type="text"
                    name="custom_service"
                    placeholder="Enter your service"
                    value={customService}
                    onChange={(e) =>
                      setCustomService(e.target.value)
                    }
                    required
                  />

                </div>

              )}

            </div>


            {/* =========================
                PROJECT DETAILS
            ========================== */}

            <div className="form-field">

              <label htmlFor="message">
                Project Details
              </label>

              <textarea
                id="message"
                name="message"
                rows="8"
                placeholder="Tell us about your project, requirements or idea..."
                required
              />

            </div>


            {/* =========================
                SUBMIT
            ========================== */}

            <button
              type="submit"
              className="contact-submit-btn"
            >

              <span>
                Send Message
              </span>

              <FiSend />

            </button>

          </form>

        </div>

      </div>


      {/* =====================================================
          CONTACT DETAILS
          SEPARATE CARDS BELOW FORM
      ===================================================== */}

      <div className="contact-details-section">

        <div className="contact-info-header">

          <span className="contact-eyebrow">
            GET IN TOUCH
          </span>

          <h3>
            We're Here to Help
          </h3>

          <p>
            Whether you need a website, web application,
            mobile app or digital solution, our team is
            ready to help you turn your idea into reality.
          </p>

        </div>


        {/* CONTACT CARDS */}

        <div className="contact-list">

          {contactInfo.map((item, index) => (

            <a
              href={item.link}
              key={index}
              className="contact-item"
              target="_blank"
              rel="noopener noreferrer"
            >

              <div className="contact-icon">
                {item.icon}
              </div>

              <div className="contact-item-content">

                <h4>
                  {item.title}
                </h4>

                <span>
                  {item.value}
                </span>

              </div>

            </a>

          ))}

        </div>


        {/* =================================================
            SOCIAL MEDIA
        ================================================= */}

        <div className="social-section">

          <span className="social-title">
            Follow XyronTech
          </span>

          <div className="social-row">

            <a
              href="https://youtube.com/@xyron_tech?si=TxNLumDpZEFMBmAY"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="XyronTech YouTube"
            >
              <FaYoutube />
              <span>YouTube</span>
            </a>


            <a
              href="https://www.instagram.com/xyronwebtech.websites?igsh=NDU1aXd0anM1dGdx"
              target="_blank"
              rel="noopener noreferrer"
              className="social-btn"
              aria-label="XyronTech Instagram"
            >
              <FaInstagram />
              <span>Instagram</span>
            </a>

          </div>

        </div>

      </div>

    </section>
  );
};

export default Contact;

