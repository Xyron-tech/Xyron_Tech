import React, { useEffect, useRef } from "react";
import "./Services.css";
import {
  FiSmartphone,
  FiBriefcase,
  FiUser,
  FiShoppingCart,
  FiTool,
  FiRefreshCw,
  FiBookOpen,
  FiCalendar,
  FiMonitor,
  FiUsers,
  FiVideo,
} from "react-icons/fi";

const services = [
  {
    icon: <FiSmartphone />,
    title: "Responsive Websites",
    desc: "Beautiful websites that work perfectly across mobile, tablet and desktop devices.",
    tag: "Mobile First",
    color: "blue",
  },
  {
    icon: <FiBriefcase />,
    title: "Business Websites",
    desc: "Professional websites that build trust and generate quality leads.",
    tag: "SEO Ready",
    color: "purple",
  },
  {
    icon: <FiUser />,
    title: "Portfolio Websites",
    desc: "Creative portfolio websites that beautifully showcase your work.",
    tag: "Creative Design",
    color: "green",
  },
  {
    icon: <FiShoppingCart />,
    title: "E-Commerce",
    desc: "Modern online stores with secure checkout and premium shopping experience.",
    tag: "Secure Payments",
    color: "orange",
  },
  {
    icon: <FiTool />,
    title: "Website Maintenance",
    desc: "Continuous monitoring, updates and optimization for your website.",
    tag: "24/7 Support",
    color: "cyan",
  },
  {
    icon: <FiRefreshCw />,
    title: "Website Redesign",
    desc: "Transform outdated websites into premium digital experiences.",
    tag: "Modern UI",
    color: "pink",
  },
{
  icon: <FiSmartphone />,
  title: "Mobile App Development",
  desc: "Modern and user-friendly mobile applications built to help businesses connect with their customers.",
  tag: "Android & iOS",
  color: "indigo",
},
{
  icon: <FiUsers />,
  title: "Social Media Growth",
  desc: "Grow your social media presence with engaging content and strategies designed to increase followers and reach.",
  tag: "Grow Your Audience",
  color: "rose",
},
{
  icon: <FiVideo />,
  title: "Video Editing",
  desc: "Professional and engaging video editing for reels, social media content, promotional videos and business branding.",
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
          // Card viewport-ku varumbothu
          // Right / Left -> Center
          entry.target.classList.add("is-visible");
        } else {
          // Card viewport-a vittu veliya pogumbothu
          // Center -> Original Right / Left
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

      <div className="services-header section-header">
        <h2 className="section-title">
          Web Development Services by Xyron Web Tech
        </h2>

        <p className="section-subtitle">
          XyronWebTech designs and develops premium digital experiences —
          responsive websites, e-commerce stores and business solutions
          built for growth and search visibility.
        </p>

        <span className="section-accent"></span>
      </div>


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
              ${index % 2 === 0
                ? "from-right"
                : "from-left"
              }
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