import { useState, useEffect } from "react";
import "./Team.css";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiCode,
  FiPenTool,
  FiSettings,
  FiMonitor,
  FiTrendingUp,
  FiCheckCircle,
  FiChevronLeft,
  FiChevronRight,
  FiEdit3,
  FiLayout,
  FiLayers,
} from "react-icons/fi";
import { TbRocket } from "react-icons/tb";

const teamMembers = [
    {
    name: "Dhanush",
    role: "Frontend Developer",
    badge: "REACT JS",
    icon: <FiMonitor />,
    description:
      "Creating responsive interfaces with smooth animations across every screen size.",
    order: 5,
  },
  {
    name: "Niranjan M",
    role: "Full Stack Developer",
    badge: "MERN STACK",
    icon: <FiCode />,
    description:
      "Modern responsive websites with clean, performant code that delivers fast, scalable and engaging digital experiences.",
    order: 1,
  },
  {
    name: "Sathish R",
    role: "MERN Stack Developer",
    badge: "FULL STACK",
    icon: <TbRocket />,
    description:
      "Developing complete MERN applications from frontend to backend deployment.",
    order: 2,
  },
  {
    name: "Vimal",
    role: ".NET & Angular Developer",
    badge: ".NET / ANGULAR",
    icon: <FiLayers />,
    description:
      "Building enterprise-grade applications with .NET framework and Angular for scalable business solutions.",
    order: 3,
  },
  {
    name: "Siva",
    role: "Frontend Developer",
    badge: "REACT JS",
    icon: <FiLayout />,
    description:
      "Creating responsive interfaces with smooth animations across every screen size.",
    order: 4,
  },

  {
    name: "Gowtham",
    role: "UI / UX Designer",
    badge: "UI DESIGN",
    icon: <FiPenTool />,
    description:
      "Designing premium user interfaces with beautiful interactions and exceptional user experiences.",
    order: 6,
  },
  {
    name: "Harisudhan",
    role: "Backend Developer",
    badge: "REST API",
    icon: <FiSettings />,
    description:
      "Building secure backend systems with scalable REST APIs and optimized databases.",
    order: 7,
  },
  {
    name: "Mahesh Kumar",
    role: "Quality Assurance Tester",
    badge: "QA TESTING",
    icon: <FiCheckCircle />,
    description:
      "Ensuring every project is bug-free, reliable and production ready before delivery.",
    order: 8,
  },
  {
    name: "G. Kumaran",
    role: "Digital Marketing Expert",
    badge: "SEO EXPERT",
    icon: <FiTrendingUp />,
    description:
      "Helping businesses grow through branding, SEO and digital marketing strategies.",
    order: 9,
  },
  {
    name: "Meeran Suhail U S",
    role: "Editor & Content Creator",
    badge: "CONTENT",
    icon: <FiEdit3 />,
    description:
      "Crafting compelling content and stories that engage audiences and elevate brand presence.",
    order: 10,
  },
];

// Sort by order
const sortedMembers = [...teamMembers].sort((a, b) => a.order - b.order);

// Card component
const TeamCard = ({ member, index }) => (
  <motion.div
    className="team-card"
    initial={{ opacity: 0, y: 50 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.6, delay: index * 0.08 }}
    whileHover={{ y: -10 }}
  >
    <div className="paper-fold"></div>
    <div className="paper-top"></div>
    <div className="paper-layer-1"></div>
    <div className="paper-layer-2"></div>
    <div className="team-icon">{member.icon}</div>
    <span className="team-badge">{member.badge}</span>
    <h3>{member.name}</h3>
    <h4>{member.role}</h4>
    <div className="team-divider"></div>
    <p>{member.description}</p>
  </motion.div>
);

export default function Team() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState("next");
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    const resize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      setIsTablet(width > 768 && width <= 1024);
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  const nextCard = () => {
    if (currentIndex >= sortedMembers.length - 1) return;
    setDirection("next");
    setCurrentIndex(currentIndex + 1);
  };

  const prevCard = () => {
    if (currentIndex <= 0) return;
    setDirection("prev");
    setCurrentIndex(currentIndex - 1);
  };

  const visibleStack = sortedMembers.slice(0, currentIndex + 1);

  // Split into rows of 4
  const row1 = sortedMembers.slice(0, 4);
  const row2 = sortedMembers.slice(4, 8);
  const row3 = sortedMembers.slice(8, 10);

  return (
    <section id="team">
      <div className="team-header section-header">
        <h2 className="section-title">Meet Our Team</h2>
        <p className="section-subtitle">
          Passionate professionals working together to build
          modern, scalable and premium digital experiences.
        </p>
        <span className="section-accent"></span>
      </div>

      {/* Desktop Layout - Section Overlay Scroll */}
      {!isMobile && !isTablet && (
        <div className="team-desktop-grid">
          {/* Row 1 */}
          <div className="row-section row-section-1">
            <div className="row-inner">
              {row1.map((member, index) => (
                <TeamCard key={member.name} member={member} index={index} />
              ))}
            </div>
          </div>

          {/* Row 2 - overlays from top */}
          <div className="row-section row-section-2">
            <div className="row-inner">
              {row2.map((member, index) => (
                <TeamCard key={member.name} member={member} index={index} />
              ))}
            </div>
          </div>

          {/* Row 3 - overlays from top */}
          <div className="row-section row-section-3">
            <div className="row-inner">
              {row3.map((member, index) => (
                <TeamCard key={member.name} member={member} index={index} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tablet Layout - 2 Column Grid */}
      {isTablet && (
        <div className="team-tablet-grid">
          {sortedMembers.map((member, index) => (
            <TeamCard key={member.name} member={member} index={index} />
          ))}
        </div>
      )}

      {/* Mobile Layout - Apple Wallet Stack */}
      {isMobile && (
        <div className="team-mobile-stack">
          <div className="stack-container">
            <AnimatePresence mode="popLayout">
              {visibleStack.map((member, index) => {
                const depth = visibleStack.length - 1 - index;
                const isTop = depth === 0;

                return (
                  <motion.div
                    key={member.name}
                    className="stack-card paper-card"
                    initial={direction === "next" 
                      ? { x: 300, y: 0, rotate: 6, scale: 1, opacity: 0 }
                      : { x: -300, y: 0, rotate: -6, scale: 1, opacity: 0 }
                    }
                    animate={{
                      x: -depth * 8,
                      y: depth * 6,
                      rotate: 0,
                      scale: 1 - (depth * 0.02),
                      opacity: 1 - (depth * 0.12),
                    }}
                    exit={direction === "next"
                      ? { x: -300, y: 0, rotate: -6, opacity: 0, scale: 0.9 }
                      : { x: 300, y: 0, rotate: 6, opacity: 0, scale: 0.9 }
                    }
                    transition={{
                      duration: 0.5,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    style={{
                      zIndex: 100 - depth,
                    }}
                    layout
                  >
                    <div className="paper-fold"></div>
                    <div className="paper-top"></div>
                    <div className="paper-layer-1"></div>
                    <div className="paper-layer-2"></div>
                    <div className="team-icon">{member.icon}</div>
                    <span className="team-badge">{member.badge}</span>
                    <h3>{member.name}</h3>
                    <h4>{member.role}</h4>
                    <div className="team-divider"></div>
                    <p>{member.description}</p>

                    {/* Navigation inside top card only */}
                    {isTop && (
                      <div className="card-nav">
                        <button
                          className={`card-nav-btn prev ${currentIndex === 0 ? "disabled" : ""}`}
                          onClick={prevCard}
                          disabled={currentIndex === 0}
                        >
                          <FiChevronLeft />
                          <span>Prev</span>
                        </button>

                        <div className="card-nav-indicator">
                          <span className="nav-current">{currentIndex + 1}</span>
                          <span className="nav-divider">/</span>
                          <span className="nav-total">{sortedMembers.length}</span>
                        </div>

                        <button
                          className={`card-nav-btn next ${currentIndex === sortedMembers.length - 1 ? "disabled" : ""}`}
                          onClick={nextCard}
                          disabled={currentIndex === sortedMembers.length - 1}
                        >
                          <span>Next</span>
                          <FiChevronRight />
                        </button>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* Stack Dots - outside card */}
          <div className="stack-dots">
            {sortedMembers.map((_, index) => (
              <button
                key={index}
                className={`stack-dot ${index === currentIndex ? "active" : ""} ${index < currentIndex ? "visited" : ""}`}
                onClick={() => {
                  setDirection(index > currentIndex ? "next" : "prev");
                  setCurrentIndex(index);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
