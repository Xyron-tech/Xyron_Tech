import React, { useCallback, useEffect, useState } from "react";
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

const wholesaleSteps = [
  {
    ...processSteps[0],
    title: "Business application",
    shortTitle: "Apply",
    tagline: "Start with your business details.",
    description: "Submit your business registration with its contact, address and store details for review.",
  },
  {
    ...processSteps[1],
    title: "Application review",
    shortTitle: "Review",
    tagline: "Xyron checks your application.",
    description: "The Xyron Super Admin reviews the application and approves or rejects the business account.",
  },
  {
    ...processSteps[2],
    title: "Set up your profile",
    shortTitle: "Brand",
    tagline: "Make the store yours.",
    description: "Add your business logo, description and optional social links to prepare your customer storefront.",
  },
  {
    ...processSteps[3],
    title: "Add products and stock",
    shortTitle: "Products",
    tagline: "Build your wholesale catalogue.",
    description: "Create product listings, set prices and manage available stock from your business workspace.",
  },
  {
    ...processSteps[4],
    title: "Configure checkout",
    shortTitle: "Payments",
    tagline: "Set customer payment details.",
    description: "Add your payment QR and instructions, delivery charge, and store banner images.",
  },
  {
    ...processSteps[5],
    title: "Publish your storefront",
    shortTitle: "Publish",
    tagline: "Share your store link.",
    description: "Publish your business storefront and share its unique link with your customers.",
  },
  {
    ...processSteps[6],
    title: "Manage incoming orders",
    shortTitle: "Orders",
    tagline: "Handle each order in one place.",
    description: "Review orders, update fulfilment status, verify submitted payment proof and answer order-specific customer messages.",
  },
  {
    ...processSteps[7],
    title: "Stay connected with Xyron",
    shortTitle: "Support",
    tagline: "Get platform help when needed.",
    description: "Message Xyron Super Admin about subscriptions, payments, store setup or technical support from your dashboard.",
  },
];

const HowWeWork = ({ variant = "default" }) => {
  const steps = variant === "wholesale" ? wholesaleSteps : processSteps;
  const isWholesale = variant === "wholesale";
  const [activeStep, setActiveStep] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState(0);

  useEffect(() => {
    document.body.style.overflow = isModalOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isModalOpen]);

  // AUTO ACTIVE CARD
  useEffect(() => {
    if (isModalOpen) return;

    const interval = setInterval(() => {
      setActiveStep((prev) => {
        if (prev >= steps.length - 1) return 0;
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isModalOpen, steps.length]);

  // OPEN MODAL
  const openModal = (index) => {
    setModalStep(index);
    setIsModalOpen(true);
  };

  // CLOSE MODAL
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // NEXT
  const nextStep = useCallback(() => {
    setModalStep((prev) =>
      prev === steps.length - 1 ? 0 : prev + 1
    );
  }, [steps.length]);

  // PREVIOUS
  const previousStep = useCallback(() => {
    setModalStep((prev) =>
      prev === 0 ? steps.length - 1 : prev - 1
    );
  }, [steps.length]);

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
  }, [isModalOpen, nextStep, previousStep]);

  const currentModalStep = steps[modalStep];

  return (
    <>
      <section className="how-we-work" id="how-we-work">
        <div className="how-we-work-container">

          {/* HEADER */}

          <div className="how-we-work-header">
            <span className="how-we-work-eyebrow">
              OUR PROCESS
            </span>

            <h2>{isWholesale ? "How Xyron Wholesale Works" : "How Xyron Web Tech Works"}</h2>

            <p>
              {isWholesale
                ? "From business application to customer orders, manage your independent wholesale store in one connected workspace."
                : "From idea to launch, XyronWebTech builds your digital solution step by step — with clarity, quality and you at every stage."}
            </p>
          </div>

          {/* PROCESS GRID */}

          <div className="process-journey">

            {/* FIRST 4 */}

            <div className="process-row">
              {steps.slice(0, 4).map((step, index) => (
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
                  width: `${(activeStep / (steps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* SECOND 4 */}

            <div className="process-row second-row">
              {steps.slice(4, 8).map((step, index) => {
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
              {isWholesale ? "Ready to set up your wholesale store?" : "Want to explore our complete process?"}
            </p>

            <button
              onClick={() => openModal(0)}
              className="explore-process-btn"
            >
              {isWholesale ? "Explore the workflow" : "Explore Our Process"}
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
                {currentModalStep.number} / {String(steps.length).padStart(2, "0")}
              </div>

              <button onClick={nextStep}>
                <span>Next</span>
                <FiChevronRight />
              </button>

            </div>

            {/* DOTS */}

            <div className="modal-dots">
              {steps.map((_, index) => (
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
