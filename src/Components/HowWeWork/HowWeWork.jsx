import React, { useEffect, useState } from "react";
import "./HowWeWork.css";

import {
  FiX,
  FiChevronLeft,
  FiChevronRight,
  FiMessageCircle,
  FiFileText,
  FiEdit3,
  FiCode,
  FiMonitor,
  FiRefreshCw,
  FiCheckCircle,
} from "react-icons/fi";

import { FaRocket } from "react-icons/fa";

const processSteps = [
  {
    number: "01",
    title: "Free Consultation",
    shortTitle: "Let's Talk",
    tagline: "Your idea starts here.",
    icon: <FiMessageCircle />,
    theme: "theme-blue",
    image:
      "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1400&q=85",
    description:
      "We listen to your idea, understand your goals and discuss the right direction for your project.",
  },
  {
    number: "02",
    title: "Requirements & Planning",
    shortTitle: "Plan It",
    tagline: "We turn ideas into a clear plan.",
    icon: <FiFileText />,
    theme: "theme-purple",
    image:
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1400&q=85",
    description:
      "We organize your requirements and plan the features, structure and technology needed for your project.",
  },
  {
    number: "03",
    title: "UI/UX Design",
    shortTitle: "Design",
    tagline: "Designed for your audience.",
    icon: <FiEdit3 />,
    theme: "theme-pink",
    image:
      "https://images.unsplash.com/photo-1561070791-2526d30994b5?auto=format&fit=crop&w=1400&q=85",
    description:
      "We create a modern, professional and user-friendly design that fits your brand and audience.",
  },
  {
    number: "04",
    title: "Development",
    shortTitle: "Build",
    tagline: "We bring the design to life.",
    icon: <FiCode />,
    theme: "theme-cyan",
    image:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1400&q=85",
    description:
      "Our team develops your digital solution with clean, responsive and scalable technology.",
  },
  {
    number: "05",
    title: "First Demo",
    shortTitle: "See It",
    tagline: "Your idea becomes real.",
    icon: <FiMonitor />,
    theme: "theme-orange",
    image:
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1400&q=85",
    description:
      "We show you the first working version so you can experience the project and share your feedback.",
  },
  {
    number: "06",
    title: "Review & Improvement",
    shortTitle: "Refine",
    tagline: "Your feedback makes it better.",
    icon: <FiRefreshCw />,
    theme: "theme-green",
    image:
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1400&q=85",
    description:
      "We review your feedback, make improvements and refine the project until it feels right.",
  },
  {
    number: "07",
    title: "Final Approval",
    shortTitle: "Approve",
    tagline: "Ready when you are.",
    icon: <FiCheckCircle />,
    theme: "theme-red",
    image:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1400&q=85",
    description:
      "Once you are satisfied with the final result, we complete the final checks before launch.",
  },
  {
    number: "08",
    title: "Deploy & Launch",
    shortTitle: "Launch",
    tagline: "Your digital journey begins.",
    icon: <FaRocket />,
    theme: "theme-gold",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1400&q=85",
    description:
      "We deploy your final project and make it ready for your audience.",
  },
];

const HowWeWork = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);

  // AUTO ACTIVE CARD
  useEffect(() => {
    if (isModalOpen) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= 7) return 0;
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isModalOpen]);

  // OPEN MODAL
  const openModal = (index) => {
    setModalStep(index);
    setIsModalOpen(true);
    document.body.style.overflow = "hidden";
  };

  // CLOSE MODAL
  const closeModal = () => {
    setIsModalOpen(false);
    document.body.style.overflow = "";
  };

  // NEXT
  const nextStep = () => {
    setModalStep((prev) =>
      prev === processSteps.length - 1 ? 0 : prev + 1
    );
  };

  // PREVIOUS
  const previousStep = () => {
    setModalStep((prev) =>
      prev === 0 ? processSteps.length - 1 : prev - 1
    );
  };

  // KEYBOARD
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isModalOpen) return;

      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextStep();
      if (e.key === "ArrowLeft") previousStep();
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  const currentModalStep = processSteps[modalStep];

  return (
    <>
      <section className="how-we-work" id="how-we-work">
        <div className="how-we-work-container">

          {/* HEADER */}

          <div className="how-we-work-header">
            <span className="how-we-work-eyebrow">
              OUR PROCESS
            </span>

            <h2>How We Work</h2>

            <p>
              From idea to launch, we build your digital solution
              step by step — with you.
            </p>
          </div>

          {/* PROCESS GRID */}

          <div className="process-journey">

            {/* FIRST 4 */}

            <div className="process-row">
              {processSteps.slice(0, 4).map((step, index) => (
                <React.Fragment key={step.number}>

                  <button
                    className={`process-card ${step.theme} ${
                      activeStep === index ? "active" : ""
                    }`}
                    onClick={() => openModal(index)}
                    onMouseEnter={() => setActiveStep(index)}
                  >
                    <div className="process-card-top">
                      <span className="process-number">
                        {step.number}
                      </span>

                      <div className="process-icon">
                        {step.icon}
                      </div>
                    </div>

                    <div className="process-card-content">
                      <span>STEP {step.number}</span>

                      <h3>{step.shortTitle}</h3>

                      <p>{step.tagline}</p>
                    </div>

                    <div className="click-hint">
                      Explore
                      <FiChevronRight />
                    </div>
                  </button>

                  {index < 3 && (
                    <div
                      className={`process-connector ${
                        activeStep > index ? "completed" : ""
                      }`}
                    />
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* JOURNEY LINE */}

            <div className="journey-middle-line">
              <div
                className="journey-progress"
                style={{
                  width: `${(activeStep / 7) * 100}%`,
                }}
              />
            </div>

            {/* SECOND 4 */}

            <div className="process-row second-row">
              {processSteps.slice(4, 8).map((step, index) => {
                const realIndex = index + 4;

                return (
                  <React.Fragment key={step.number}>

                    <button
                      className={`process-card ${step.theme} ${
                        activeStep === realIndex ? "active" : ""
                      }`}
                      onClick={() => openModal(realIndex)}
                      onMouseEnter={() =>
                        setActiveStep(realIndex)
                      }
                    >
                      <div className="process-card-top">
                        <span className="process-number">
                          {step.number}
                        </span>

                        <div className="process-icon">
                          {step.icon}
                        </div>
                      </div>

                      <div className="process-card-content">
                        <span>STEP {step.number}</span>

                        <h3>{step.shortTitle}</h3>

                        <p>{step.tagline}</p>
                      </div>

                      <div className="click-hint">
                        Explore
                        <FiChevronRight />
                      </div>
                    </button>

                    {index < 3 && (
                      <div
                        className={`process-connector ${
                          activeStep > realIndex
                            ? "completed"
                            : ""
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* CTA */}

          <div className="how-we-work-cta">
            <p>
              Want to explore our complete process?
            </p>

            <button
              onClick={() => openModal(0)}
              className="explore-process-btn"
            >
              Explore Our Process
              <FiChevronRight />
            </button>
          </div>

        </div>
      </section>

      {/* MODAL */}

      {isModalOpen && (
        <div
          className="process-modal-overlay"
          onClick={closeModal}
        >
          <div
            className="process-modal"
            onClick={(e) => e.stopPropagation()}
          >

            <button
              className="process-close-btn"
              onClick={closeModal}
              aria-label="Close"
            >
              <FiX />
            </button>

            <div className="modal-content">

              {/* IMAGE */}

              <div className="modal-image-wrapper">
                <img
                  key={currentModalStep.image}
                  src={currentModalStep.image}
                  alt={currentModalStep.title}
                />

                <div className="modal-image-overlay" />

                <span className="modal-image-number">
                  {currentModalStep.number}
                </span>
              </div>

              {/* DETAILS */}

              <div className="modal-details">

                <span className="modal-step-label">
                  STEP {currentModalStep.number}
                </span>

                <div className="modal-icon">
                  {currentModalStep.icon}
                </div>

                <h3>
                  {currentModalStep.title}
                </h3>

                <p>
                  {currentModalStep.description}
                </p>

              </div>
            </div>

            {/* NAVIGATION */}

            <div className="modal-navigation">

              <button onClick={previousStep}>
                <FiChevronLeft />
                <span>Previous</span>
              </button>

              <div className="modal-counter">
                {currentModalStep.number} / 08
              </div>

              <button onClick={nextStep}>
                <span>Next</span>
                <FiChevronRight />
              </button>

            </div>

            {/* DOTS */}

            <div className="modal-dots">
              {processSteps.map((_, index) => (
                <button
                  key={index}
                  className={
                    modalStep === index ? "active" : ""
                  }
                  onClick={() => setModalStep(index)}
                  aria-label={`Step ${index + 1}`}
                />
              ))}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default HowWeWork;