import { useEffect, useRef } from "react";
import "./Projects.css";

import {
  FiExternalLink,
  FiArrowUpRight,
} from "react-icons/fi";

import portfolio from "../../assets/portfolio.webp";
import srikrishnarestaurant from "../../assets/srikrishnarestaurant.webp";
import srivarahidattaguru from "../../assets/srivarahidattaguru.webp";


/* =========================================================
   PROJECT DATA
========================================================= */

const projects = [
  {
    id: "01",

    image: srikrishnarestaurant,

    title: "Sri Krishna Restaurant",

    tools: [
      "HTML",
      "CSS",
      "JavaScript",
      "Firebase",
    ],

    link:
      "https://nttechworks5.github.io/-Sri-Krishna-Restaurant/",

    color: "blue",
  },

  {
    id: "02",

    image: portfolio,

    title: "APK Infotech Pvt. Ltd.",

    tools: [
      "React",
      "JavaScript",
      "CSS",
      "Vercel",
    ],

    link:
      "https://apk-info-tech-94vd.vercel.app",

    color: "purple",
  },

  {
    id: "03",

    image: srivarahidattaguru,

    title: "Sri Varahi Datta Guru Trust",

    tools: [
      "React",
      "Express",
      "MongoDB",
      "Razorpay",
    ],

    link:
      "https://www.srivarahidattagurutrust.com",

    color: "blue",
  },
];


/* =========================================================
   COMPONENT
========================================================= */

const Projects = () => {

  const sectionRef = useRef(null);

  const pathRef = useRef(null);

  const mobilePathRef = useRef(null);


  /* =======================================================
     SCROLL ANIMATION
  ======================================================= */

  useEffect(() => {

    const section =
      sectionRef.current;

    const path =
      pathRef.current;

    const mobilePath =
      mobilePathRef.current;

    if (!section) return;


    /* -------------------------------------------------------
       DESKTOP PATH
    ------------------------------------------------------- */

    let desktopLength = 0;

    if (path) {

      desktopLength =
        path.getTotalLength();

      path.style.strokeDasharray =
        desktopLength;

      path.style.strokeDashoffset =
        desktopLength;
    }


    /* -------------------------------------------------------
       MOBILE PATH
    ------------------------------------------------------- */

    let mobileLength = 0;

    if (mobilePath) {

      mobileLength =
        mobilePath.getTotalLength();

      mobilePath.style.strokeDasharray =
        mobileLength;

      mobilePath.style.strokeDashoffset =
        mobileLength;
    }


    /* =======================================================
       PATH DRAW ON SCROLL
    ======================================================= */

    const updatePath = () => {

      const rect =
        section.getBoundingClientRect();

      const viewportHeight =
        window.innerHeight;


      /*
        Animation starts when section
        reaches around 80% viewport.
      */

      const start =
        viewportHeight * 0.82;


      /*
        Animation finishes when
        section almost leaves viewport.
      */

      const end =
        -rect.height +
        viewportHeight * 0.25;


      let progress =
        (start - rect.top) /
        (start - end);


      progress =
        Math.max(
          0,
          Math.min(1, progress)
        );


      if (path) {

        path.style.strokeDashoffset =
          desktopLength *
          (1 - progress);
      }


      if (mobilePath) {

        mobilePath.style.strokeDashoffset =
          mobileLength *
          (1 - progress);
      }
    };


    /* =======================================================
       CARD REVEAL
    ======================================================= */

    const cards =
      section.querySelectorAll(
        ".journey-card"
      );


    const observer =
      new IntersectionObserver(

        (entries) => {

          entries.forEach(
            (entry) => {

              if (
                entry.isIntersecting
              ) {

                entry.target.classList.add(
                  "journey-card-visible"
                );

              }

            }
          );

        },

        {
          threshold: 0.22,

          /*
            Card reveal only when it
            enters a comfortable area.
          */

          rootMargin:
            "0px 0px -100px 0px",
        }
      );


    cards.forEach(
      (card) =>
        observer.observe(card)
    );


    /* =======================================================
       EVENTS
    ======================================================= */

    window.addEventListener(
      "scroll",
      updatePath,
      {
        passive: true,
      }
    );


    window.addEventListener(
      "resize",
      updatePath
    );


    updatePath();


    /* =======================================================
       CLEANUP
    ======================================================= */

    return () => {

      observer.disconnect();

      window.removeEventListener(
        "scroll",
        updatePath
      );

      window.removeEventListener(
        "resize",
        updatePath
      );

    };

  }, []);


  /* =========================================================
     RENDER
  ========================================================= */

  return (

    <section
      className="projects-section"
      id="projects"
      ref={sectionRef}
    >

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="projects-header">

        <span className="projects-eyebrow">
          OUR JOURNEY
        </span>


        <h2 className="section-title">

          Our Projects

          <span>
            {" "}So Far
          </span>

        </h2>


        <p className="section-subtitle">

          A visual journey through websites
          and digital experiences crafted
          by Xyron Web Tech.

        </p>


        <span
          className="section-accent"
          aria-hidden="true"
        />

      </div>


      {/* =====================================================
          JOURNEY
      ===================================================== */}

      <div className="projects-journey">


        {/* ===================================================
            DESKTOP / TABLET PATH
        =================================================== */}

        <svg
          className="journey-path journey-path-desktop"
          viewBox="0 0 1000 2500"
          preserveAspectRatio="none"
          aria-hidden="true"
        >

          <path
            className="journey-path-shadow"
            d="
              M 500 0

              C 500 150,
                820 180,
                820 380

              C 820 580,
                180 620,
                180 830

              C 180 1040,
                820 1080,
                820 1290

              C 820 1500,
                180 1540,
                180 1750

              C 180 1960,
                820 2000,
                820 2200

              C 820 2350,
                600 2430,
                500 2500
            "
          />


          <path
            ref={pathRef}
            className="journey-path-line"
            d="
              M 500 0

              C 500 150,
                820 180,
                820 380

              C 820 580,
                180 620,
                180 830

              C 180 1040,
                820 1080,
                820 1290

              C 820 1500,
                180 1540,
                180 1750

              C 180 1960,
                820 2000,
                820 2200

              C 820 2350,
                600 2430,
                500 2500
            "
          />

        </svg>


        {/* ===================================================
            MOBILE PATH
        =================================================== */}

        <svg
          className="journey-path journey-path-mobile"
          viewBox="0 0 100 1900"
          preserveAspectRatio="none"
          aria-hidden="true"
        >

          <path
            className="journey-path-shadow"
            d="
              M 18 0

              C 18 120,
                65 170,
                65 300

              C 65 430,
                18 480,
                18 610

              C 18 740,
                65 790,
                65 920

              C 65 1050,
                18 1100,
                18 1230

              C 18 1360,
                65 1410,
                65 1540

              C 65 1670,
                18 1740,
                18 1900
            "
          />


          <path
            ref={mobilePathRef}
            className="journey-path-line"
            d="
              M 18 0

              C 18 120,
                65 170,
                65 300

              C 65 430,
                18 480,
                18 610

              C 18 740,
                65 790,
                65 920

              C 65 1050,
                18 1100,
                18 1230

              C 18 1360,
                65 1410,
                65 1540

              C 65 1670,
                18 1740,
                18 1900
            "
          />

        </svg>


        {/* ===================================================
            PROJECT CARDS
        =================================================== */}

        {projects.map(
          (project, index) => (

            <div
              key={project.id}
              className={`
                journey-row
                ${
                  index % 2 === 0
                    ? "journey-left"
                    : "journey-right"
                }
              `}
            >

              {/* ---------------------------------------------
                  NUMBER DOT
              --------------------------------------------- */}

              <div className="journey-dot">

                <span>
                  {project.id}
                </span>

              </div>


              {/* ---------------------------------------------
                  CLICKABLE CARD
              --------------------------------------------- */}

              <a
                href={project.link}
                target="_blank"
                rel="noopener noreferrer"
                className={`
                  journey-card-link
                  project-${project.color}
                `}
                aria-label={`View ${project.title}`}
              >

                <article className="journey-card">


                  {/* =========================================
                      IMAGE
                  ========================================= */}

                  <div className="project-image">

                    <img
                      src={project.image}
                      alt={project.title}
                      loading="lazy"
                    />


                    <div className="image-overlay" />


                    <div className="project-category">

                      PROJECT{" "}

                      {project.id}

                    </div>


                    <div className="view-project">

                      <span>
                        View Project
                      </span>

                      <FiArrowUpRight />

                    </div>

                  </div>


                  {/* =========================================
                      CONTENT
                  ========================================= */}

                  <div className="project-content">


                    <div className="project-number">

                      {project.id}

                    </div>


                    <div className="project-info">


                      <span className="journey-label">

                        PROJECT{" "}

                        {project.id}

                      </span>


                      <h3>
                        {project.title}
                      </h3>


                      {/* =====================================
                          TOOLS
                      ===================================== */}

                      <div className="project-tools">

                        <span className="tools-label">
                          Built With
                        </span>


                        <div className="tools-list">

                          {project.tools.map(
                            (tool) => (

                              <span
                                key={tool}
                                className="tool-pill"
                              >
                                {tool}
                              </span>

                            )
                          )}

                        </div>

                      </div>

                    </div>


                    {/* =====================================
                        FOOTER
                    ===================================== */}

                    <div className="project-footer">

                      <span className="project-link-text">

                        Explore Project

                      </span>


                      <div className="project-links">

                        <FiExternalLink />

                      </div>

                    </div>

                  </div>

                </article>

              </a>

            </div>

          )
        )}

      </div>

    </section>
  );
};


export default Projects;
