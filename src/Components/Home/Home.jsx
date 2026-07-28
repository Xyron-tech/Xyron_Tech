import React, { useEffect, useRef } from "react";
import "./Home.css";
import SEO from "../SEO/SEO";
import {
  Swiper,
  SwiperSlide,
} from "swiper/react";
<>
    <SEO
        title="XYRON Web Tech | Professional Website Development"
        description="Professional Website Development Company specializing in React websites, UI/UX Design and SEO."
        keywords="Website Development, React, UI UX, SEO, Web Design, Full Stack"
    />

    {/* Existing Home Code */}
</>
import {
  Autoplay,
  Pagination,
  Navigation,
} from "swiper/modules";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

import {
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiSettings,
  FiArrowUpRight,
} from "react-icons/fi";

import ecommerce from "../../assets/ecommerce.webp";
import business from "../../assets/business.webp";
import portfolio from "../../assets/portfolioslider.webp";
import webapp from "../../assets/webapp.webp";


/* =========================================
   HERO SLIDES
========================================= */

const slides = [
  {
    id: 1,
    badge: "E-Commerce Website",

    title: (
      <>
        Build Online
        <br />
        <span className="gradient-text">
          Stores That Sell 24/7
        </span>
      </>
    ),

    description:
      "Launch a premium online store with secure payments, fast performance and a seamless shopping experience designed to help your business grow.",

    primaryBtn: "View Our Work",
    secondaryBtn: "Start Your Store",

    image: ecommerce,
  },

  {
    id: 2,
    badge: "Business Website",

    title: (
      <>
        Professional Websites
        <br />
        <span className="gradient-text">
          That Build Trust
        </span>
      </>
    ),

    description:
      "Create a modern business website that strengthens your brand, builds credibility and helps you connect with the right audience.",

    primaryBtn: "View Our Work",
    secondaryBtn: "Build My Website",

    image: business,
  },

  {
    id: 3,
    badge: "Portfolio Website",

    title: (
      <>
        Showcase Your
        <br />
        <span className="gradient-text">
          Skills & Projects
        </span>
      </>
    ),

    description:
      "Present your work beautifully with a professional portfolio designed to showcase your skills and create a strong first impression.",

    primaryBtn: "View Our Work",
    secondaryBtn: "Create Portfolio",

    image: portfolio,
  },

  {
    id: 4,
    badge: "Custom Web Application",

    title: (
      <>
        Powerful Business
        <br />
        <span className="gradient-text">
          Web Applications
        </span>
      </>
    ),

    description:
      "From admin panels and dashboards to booking systems and custom workflows, we build solutions around your business needs.",

    primaryBtn: "View Our Work",
    secondaryBtn: "Discuss Project",

    image: webapp,
  },
];


/* =========================================
   HOME HIGHLIGHT CARDS
========================================= */

const highlights = [
  {
    id: 1,
    icon: <FiClock />,
    value: "24/7",
    title: "Support When You Need It",
    description:
      "Stay connected with us throughout your project and get support when it matters.",
  },

  {
    id: 2,
    icon: <FiCheckCircle />,
    value: "13+",
    title: "Projects Delivered",
    description:
      "Real digital projects delivered across websites and custom web solutions.",
  },

  {
    id: 3,
    icon: <FiUsers />,
    value: "Client",
    title: "First Approach",
    description:
      "We understand your goals and work closely with you before building your solution.",
  },

  {
    id: 4,
    icon: <FiSettings />,
    value: "Custom",
    title: "Solutions For Your Needs",
    description:
      "Every project is designed around your business requirements, goals and workflow.",
  },
];


/* =========================================
   HOME COMPONENT
========================================= */

const Header = () => {

  const swiperRef = useRef(null);
  const revealRef = useRef(null);


  /* =========================================
     SCROLL REVEAL ANIMATION
     Works for DOWN + UP scroll
  ========================================= */

  useEffect(() => {

    const elements =
      revealRef.current?.querySelectorAll(
        ".home-reveal"
      );

    if (!elements?.length) return;


    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "home-reveal-visible"
              );

            } else {

              /*
                Remove class when element leaves viewport.

                This makes animation replay when:
                ↓ Down scroll
                ↑ Up scroll
              */

              entry.target.classList.remove(
                "home-reveal-visible"
              );

            }

          });

        },
        {
          threshold: 0.15,

          rootMargin:
            "0px 0px -60px 0px",
        }
      );


    elements.forEach((element) => {

      observer.observe(element);

    });


    return () => {

      observer.disconnect();

    };

  }, []);


  /* =========================================
     VIEW PROJECTS
  ========================================= */

  const handleViewWork = () => {

    document
      .getElementById("projects")
      ?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

  };


  /* =========================================
     WHATSAPP
  ========================================= */

  const handleWhatsApp = () => {

    const message =
      "Hello XyronTech, I'm interested in building a website.";

    const whatsappUrl =
      `https://wa.me/919626782279?text=${encodeURIComponent(
        message
      )}`;

    window.open(
      whatsappUrl,
      "_blank",
      "noopener,noreferrer"
    );

  };


  return (

    <section
      id="home"
      ref={revealRef}
    >

      {/* =================================
          BACKGROUND DECORATION
      ================================== */}

      <div
        className="home-orb home-orb-one"
        aria-hidden="true"
      />

      <div
        className="home-orb home-orb-two"
        aria-hidden="true"
      />

      <div
        className="home-grid-pattern"
        aria-hidden="true"
      />


      <div className="Container">


        {/* =================================
            HERO SLIDER
        ================================== */}

        <div className="hero-slider-wrapper">


          <Swiper
            modules={[
              Autoplay,
              Pagination,
              Navigation,
            ]}

            loop={true}

            speed={900}

            slidesPerView={1}

            spaceBetween={0}

            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
              pauseOnMouseEnter: true,
            }}

            pagination={{
              el: ".hero-pagination",
              clickable: true,
            }}

            navigation={{
              nextEl: ".hero-next",
              prevEl: ".hero-prev",
            }}

            onSwiper={(swiper) => {

              swiperRef.current = swiper;

            }}

            className="heroSwiper"
          >


            {slides.map(
              (item, index) => (

                <SwiperSlide
                  key={item.id}
                >

                  <div className="hero-slide">


                    {/* =================================
                        LEFT CONTENT
                    ================================== */}

                    <div className="header-content">


                      {/* Badge */}

                      <div className="header-badge hero-animate hero-animate-one">

                        <span className="badge-dot" />

                        {item.badge}

                      </div>


                      {/* Title */}

                      <h1 className="hero-animate hero-animate-two">

                        {item.title}

                      </h1>


                      {/* Description */}

                      <p className="hero-animate hero-animate-three">

                        {item.description}

                      </p>


                      {/* Buttons */}

                      <div className="header-btn hero-animate hero-animate-four">


                        <button
                          type="button"
                          className="header-btn1"
                          onClick={
                            handleViewWork
                          }
                        >

                          <span>
                            {item.primaryBtn}
                          </span>

                          <FiArrowUpRight />

                        </button>


                        <button
                          type="button"
                          className="header-btn2"
                          onClick={
                            handleWhatsApp
                          }
                        >

                          {item.secondaryBtn}

                        </button>


                      </div>


                      {/* Small Trust Text */}

                      <div className="hero-trust hero-animate hero-animate-five">

                        <span className="trust-check">
                          <FiCheckCircle />
                        </span>

                        <span>
                          Modern • Responsive • User-Friendly
                        </span>

                      </div>


                    </div>


                    {/* =================================
                        RIGHT IMAGE
                    ================================== */}

                    <div className="header-img hero-visual">


                      <div className="image-glow" />


                      <div className="image-frame">


                        <div className="image-shine" />


                        <img
                          src={item.image}
                          alt={item.badge}
                          loading={
                            index === 0
                              ? "eager"
                              : "lazy"
                          }
                          draggable="false"
                        />


                        <div className="floating-chip chip-one">

                          <FiCheckCircle />

                          <span>
                            Premium UI
                          </span>

                        </div>


                        <div className="floating-chip chip-two">

                          <span className="chip-dot" />

                          Fast & Responsive

                        </div>


                      </div>

                    </div>


                  </div>

                </SwiperSlide>

              )
            )}

          </Swiper>


          {/* =================================
              SLIDER CONTROLS
          ================================== */}

          <div className="hero-controls">


            <div
              className="hero-pagination"
              aria-label="Hero slide pagination"
            />


            <div className="hero-navigation">


              <button
                type="button"
                className="hero-prev"
                aria-label="Previous slide"
              >

                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >

                  <polyline points="15 18 9 12 15 6" />

                </svg>

              </button>


              <button
                type="button"
                className="hero-next"
                aria-label="Next slide"
              >

                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >

                  <polyline points="9 18 15 12 9 6" />

                </svg>

              </button>


            </div>

          </div>

        </div>


        {/* =================================
            HIGHLIGHT CARDS
        ================================== */}

        <div className="home-highlights">


          {highlights.map(
            (item, index) => (

              <article
                className={`highlight-card home-reveal reveal-from-${index % 2 === 0 ? "left" : "right"}`}
                key={item.id}
              >


                <div className="highlight-card-glow" />


                {/* Icon */}

                <div className="highlight-icon">

                  {item.icon}

                </div>


                {/* Value */}

                <div className="highlight-value">

                  {item.value}

                </div>


                {/* Title */}

                <h3>

                  {item.title}

                </h3>


                {/* Description */}

                <p>

                  {item.description}

                </p>


                <span className="highlight-line" />


              </article>

            )
          )}

        </div>


      </div>

    </section>

  );

};


export default Header;