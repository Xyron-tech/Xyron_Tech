import React from "react";
import "./About.css";

import {
  FiTarget,
  FiEye,
} from "react-icons/fi";

import { TbDiamond } from "react-icons/tb";

const aboutCards = [
  {
    id: 1,
    icon: <FiTarget />,
    title: "Our Mission",
    description:
      "To help businesses and individuals build a strong digital presence through modern, user-friendly and reliable web solutions.",
  },
  {
    id: 2,
    icon: <FiEye />,
    title: "Our Vision",
    description:
      "To become a trusted digital technology partner for businesses by creating meaningful digital experiences that support their growth.",
  },
  {
    id: 3,
    icon: <TbDiamond />,
    title: "Our Values",
    description:
      "Quality, transparency, creativity and continuous learning guide the way we work and build every digital solution.",
  },
];

const About = () => {
  return (
    <section id="about">

      {/* =========================
          SECTION HEADER
      ========================== */}

      <div className="about-header">
        <span className="about-eyebrow">
          About Us
        </span>

        <h2>
          We Build Digital Experiences
          <br />
          <span>That Make an Impact</span>
        </h2>

        <p>
          XyronTech is a technology-focused digital solutions team
          helping businesses, startups and individuals build modern,
          responsive and user-friendly digital experiences.
        </p>

        <div className="about-accent" />
      </div>


      {/* =========================
          MISSION / VISION / VALUES
      ========================== */}

      <div className="about-cards">

        {aboutCards.map((card) => (
          <article
            className="about-card"
            key={card.id}
          >

            {/* Icon */}

            <div className="about-card-icon">
              {card.icon}
            </div>


            {/* Content */}

            <div className="about-card-content">

              <h3>
                {card.title}
              </h3>

              <p>
                {card.description}
              </p>

            </div>

          </article>
        ))}

      </div>

    </section>
  );
};

export default About;