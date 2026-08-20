import React, { useEffect, useRef } from "react";
import "./Services.css";

import {
  FiSmartphone,
  FiBriefcase,
  FiUser,
  FiShoppingCart,
  FiTool,
  FiRefreshCw,
  FiUsers,
  FiVideo,
} from "react-icons/fi";

const services = [
  {
    icon: <FiSmartphone />,
    title: "Responsive Websites",
    desc: "Fast, modern websites that deliver a seamless experience across mobile, tablet and desktop.",
    tag: "Mobile First",
    color: "blue",
  },
  {
    icon: <FiBriefcase />,
    title: "Business Websites",
    desc: "Professional websites designed to build trust, showcase your brand and generate quality leads.",
    tag: "SEO Ready",
    color: "purple",
  },
  {
    icon: <FiUser />,
    title: "Portfolio Websites",
    desc: "Creative and professional portfolio websites that present your work, skills and personal brand.",
    tag: "Creative Design",
    color: "green",
  },
  {
    icon: <FiShoppingCart />,
    title: "E-Commerce Websites",
    desc: "Secure and user-friendly online stores built for smooth shopping, payments and business growth.",
    tag: "Secure Payments",
    color: "orange",
  },
  {
    icon: <FiTool />,
    title: "Website Maintenance",
    desc: "Reliable website updates, performance optimization and ongoing technical support when you need it.",
    tag: "Ongoing Support",
    color: "cyan",
  },
  {
    icon: <FiRefreshCw />,
    title: "Website Redesign",
    desc: "Transform outdated websites into modern, responsive and conversion-focused digital experiences.",
    tag: "Modern UI",
    color: "pink",
  },
  {
    icon: <FiSmartphone />,
    title: "Mobile App Development",
    desc: "Modern mobile applications designed to help businesses connect with customers and grow digitally.",
    tag: "Android & iOS",
    color: "indigo",
  },
  {
    icon: <FiUsers />,
    title: "Social Media Growth",
    desc: "Engaging content and practical strategies designed to improve your reach, audience and online presence.",
    tag: "Grow Your Audience",
    color: "rose",
  },
  {
    icon: <FiVideo />,
    title: "Video Editing",
    desc: "Professional editing for reels, promotional videos and social media content that strengthens your brand.",
    tag: "Creative Content",
    color: "amber",
  },
];

export default function Services() {
  const gridRef = useRef(null);

  useEffect(() => {
    const cards = gridRef.current?.querySelectorAll(".service-card");

    if (!cards?.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
          } else {
            entry.target.classList.remove("is-visible");
          }
        });
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -10% 0px",
      }
    );

    cards.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  return (
    <section id="services">

      {/* =========================
          SECTION HEADER
      ========================== */}

      <div className="services-header section-header">

        <span className="services-eyebrow">
          
        </span>

        <h2 className="section-title">
          Digital Solutions Built
          <br />
          <span>For Your Business Growth</span>
        </h2>

        <p className="section-subtitle">
          From professional websites to e-commerce, mobile apps and digital
          content, we create modern solutions that help your brand grow online.
        </p>

        <span className="section-accent"></span>

      </div>


      {/* =========================
          SERVICES GRID
      ========================== */}

      <div
        className="services-grid"
        ref={gridRef}
      >

        {services.map((service, index) => (

          <article
            key={service.title}
            className={`
              service-card
              card-${service.color}
              ${index % 2 === 0 ? "from-right" : "from-left"}
            `}
          >

            <div className="card-glow"></div>

            <div className="card-shine"></div>


            <div className="service-card-content">

              <div className="service-icon">
                {service.icon}
              </div>

              <h3>
                {service.title}
              </h3>

              <p>
                {service.desc}
              </p>

              <div className="service-tag">
                {service.tag}
              </div>

            </div>

          </article>

        ))}

      </div>

    </section>
  );
}