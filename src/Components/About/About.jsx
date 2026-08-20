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
      "We help businesses build a strong digital presence through modern, user-friendly and reliable web solutions.",
  },
  {
    id: 2,
    icon: <FiEye />,
    title: "Our Vision",
    description:
      "To become a trusted technology partner by creating meaningful digital experiences that help businesses grow.",
  },
  {
    id: 3,
    icon: <TbDiamond />,
    title: "Our Values",
    description:
      "Quality, transparency, creativity and continuous learning shape everything we design and develop.",
  },
];

const About = () => {
  return (
    <section id="about">

      {/* =========================================
          SECTION HEADER
      ========================================= */}

      <div className="about-header">

        <span className="about-eyebrow">
          About Us
        </span>

        <h2>
          Building Digital Experiences
          <br />
          <span>That Make an Impact</span>
        </h2>

        <p>
          Xyron Web Tech helps businesses, startups and individuals
          build modern, responsive and professional digital experiences
          designed for growth.
        </p>

        <div className="about-accent" />

      </div>


      {/* =========================================
          MISSION / VISION / VALUES
      ========================================= */}

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