import React from "react";
import "./Projects.css";

import {
  FiArrowUpRight,
  FiExternalLink,
} from "react-icons/fi";

import Restaurantwebsite from "../../assets/Restaurantwebsite.webp";
import gym from "../../assets/gym.webp";
import EdTecheducation from "../../assets/EdTecheducation.webp";
import portfolio from "../../assets/portfolio.webp";
import shopeaseecommerce from "../../assets/shopeaseecommerce.webp";
import srikrishnarestaurant from "../../assets/srikrishnarestaurant.webp";
const projects = [

{
  image: srikrishnarestaurant,
  title: "Sri Krishna Restaurant",
  desc: "A complete restaurant management website featuring digital menu, QR code ordering, online food ordering, billing system, order tracking, and admin dashboard for seamless restaurant operations.",
  link: "https://nttechworks5.github.io/-Sri-Krishna-Restaurant/"
},

  {
    image: portfolio,
title: "APK Infotech Pvt. Ltd.",
desc: "A modern corporate website built for APK Infotech showcasing IT services, internships, placement support, training programs, and responsive business solutions.",
link: "https://apk-info-tech-94vd.vercel.app"
  }
];
const Projects = () => {

  return (

  <section className="projects-section" id="projects">

      <div className="projects-header section-header">
        <h2 className="section-title">Our Projects</h2>
        <p className="section-subtitle">
          Discover some of our latest projects crafted with
          modern technologies and exceptional user experience.
        </p>
        <span className="section-accent" aria-hidden="true" />
      </div>

      <div className="projects-grid">
{projects.map((project, index) => (

  <a
    key={index}
    href={project.link}
    target="_blank"
    rel="noopener noreferrer"
    className="project-card-link"
  >

    <div className="project-card">

      <div className="project-image">
        <img
          src={project.image}
          alt={project.title}
        />
      </div>

      <div className="project-content">

        <h3>{project.title}</h3>

        <p>{project.desc}</p>

        <div className="project-links">
          <FiExternalLink />
        </div>

      </div>

    </div>

  </a>

))}

      </div>

  

    </section>

  );

};

export default Projects;