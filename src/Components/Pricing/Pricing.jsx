import React from "react";
import "./Pricing.css";
import PricingCard from "./PricingCard";

import { TbRocket, TbHexagon } from "react-icons/tb";
import { FiBriefcase } from "react-icons/fi";

const Pricing = () => {
  const PricingCards = [

    {
      icon: <TbRocket />,
      title: "Starter",
      plan: "Starter Website",
      price: "₹4,999",
      services: [
        "Responsive Design",
        "Up to 3 Pages",
        "Contact Form",
        "Basic SEO Setup",
        "7 Days Support"
      ],
      btn: "Get Started",
      theme: "starter"
    },

    {
      icon: <FiBriefcase />,
      title: "Business Website",
      plan: "Business Website",
      price: "₹9,999",
      services: [
        "Responsive Design",
        "Up to 8 Pages",
        "Contact Form",
        "Basic SEO Setup",
        "Fast Performance",
        "14 Days Support"
      ],
      btn: "Choose Plan",
      theme: "business"
    },

    {
      icon: <TbHexagon />,
      title: "Premium Website",
      plan: "Premium Website",
      price: "₹14,999+",
      services: [
        "Custom Design",
        "Unlimited Pages",
        "Advanced Animations",
        "Performance Optimization",
        "30 Days Support"
      ],
      btn: "Contact Me",
      theme: "premium"
    }

  ];

  return (

    <section className="Pricing" id="pricing">

      <div className="Pricing-header">

        <div className="Pricing-badge">
          ✦ Pricing
        </div>

        <h1>
          Flexible <span>Pricing</span> for Every Business
        </h1>

        <p>
          Choose a plan that fits your business needs and budget.
        </p>

     

      </div>
      

      <div className="Pricing-container">

        {PricingCards.map((card) => (

          <PricingCard
            key={card.title}
            icon={card.icon}
            title={card.title}
            plan={card.plan}
            price={card.price}
            services={card.services}
            btn={card.btn}
            theme={card.theme}
          />

        ))}

      </div>

    </section>

  );

};

export default Pricing;