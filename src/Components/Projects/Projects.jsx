import React, { useEffect, useRef } from "react";
import "./Projects.css";
import SEO from "../SEO/SEO";
import {
  FiExternalLink,
  FiArrowUpRight,
} from "react-icons/fi";

import portfolio from "../../assets/portfolio.webp";
import srikrishnarestaurant from "../../assets/srikrishnarestaurant.webp";
<SEO
title="Projects | XYRON Web Tech"
description="View our latest projects."
keywords="Portfolio, Website Projects"
/>
const projects = [
  {
    image: srikrishnarestaurant,
    title: "Sri Krishna Restaurant",
    category: "Restaurant Management",
    desc: "A complete restaurant management website featuring digital menu, QR code ordering, online food ordering, billing system, order tracking, and admin dashboard for seamless restaurant operations.",
    link: "https://nttechworks5.github.io/-Sri-Krishna-Restaurant/",
    color: "blue",
  },

  {
    image: portfolio,
    title: "APK Infotech Pvt. Ltd.",
    category: "Corporate Website",
    desc: "A modern corporate website built for APK Infotech showcasing IT services, internships, placement support, training programs, and responsive business solutions.",
    link: "https://apk-info-tech-94vd.vercel.app",
    color: "purple",
  },
];

const Projects = () => {

  const projectRef = useRef(null);

  useEffect(() => {

    const cards =
      projectRef.current?.querySelectorAll(
        ".project-card"
      );

    if (!cards?.length) return;

    const observer =
      new IntersectionObserver(
        (entries) => {

          entries.forEach((entry) => {

            if (entry.isIntersecting) {

              entry.target.classList.add(
                "project-visible"
              );

            } else {

              entry.target.classList.remove(
                "project-visible"
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

    cards.forEach((card) =>
      observer.observe(card)
    );

    return () =>
      observer.disconnect();

  }, []);


  return (

    <section
      className="projects-section"
      id="projects"
    >

      {/* =========================
          HEADER
      ========================== */}

      <div className="projects-header section-header">

        <span className="projects-eyebrow">
          OUR WORK
        </span>

        <h2 className="section-title">
          Projects We’re Proud Of
        </h2>

        <p className="section-subtitle">
          Discover some of our latest digital
          experiences crafted with modern
          technologies, creative design and
          exceptional user experience.
        </p>

        <span
          className="section-accent"
          aria-hidden="true"
        />

      </div>


      {/* =========================
          PROJECT GRID
      ========================== */}

      <div
        className="projects-grid"
        ref={projectRef}
      >

        {projects.map(
          (project, index) => (

            <a
              key={project.title}
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`project-card-link project-${project.color}`}
            >

              <article
                className={`project-card ${
                  index % 2 === 0
                    ? "project-from-left"
                    : "project-from-right"
                }`}
              >

                {/* =========================
                    IMAGE
                ========================== */}

                <div className="project-image">

                  <img
                    src={project.image}
                    alt={project.title}
                    loading="lazy"
                  />

                  <div className="image-overlay" />

                  <div className="project-category">
                    {project.category}
                  </div>

                  <div className="view-project">

                    <span>
                      View Project
                    </span>

                    <FiArrowUpRight />

                  </div>

                </div>


                {/* =========================
                    CONTENT
                ========================== */}

                <div className="project-content">

                  <div className="project-number">
                    0{index + 1}
                  </div>

                  <div className="project-info">

                    <h3>
                      {project.title}
                    </h3>

                    <p>
                      {project.desc}
                    </p>

                  </div>


                  {/* =========================
                      ACTION
                  ========================== */}

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

          )
        )}

      </div>

    </section>

  );

};

export default Projects;