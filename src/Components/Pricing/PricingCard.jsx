import { FiCheck } from "react-icons/fi";

const PricingCard = ({
  icon,
  title,
  plan,
  price,
  services,
  btn,
  theme,
}) => {

  const handlePlanSelection = () => {

    // Save selected plan
    localStorage.setItem("selectedPlan", plan);

    // Scroll to Contact section
    const contactSection = document.getElementById("contact");

    if (contactSection) {

      contactSection.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });

    }

  };

  return (

    <div className={`Pricing-card ${theme}`}>

      <div className="Pricingicon">

        {icon}

      </div>

      <h3>{title}</h3>

      <h1>{price}</h1>

      <hr className="hr-line" />

      <ul className="pricing-services">

        {services.map((service) => (

          <li key={service}>

            <FiCheck className="Check-icon" />

            {service}

          </li>

        ))}

      </ul>

      <button onClick={handlePlanSelection}>

        {btn}

      </button>

    </div>

  );

};

export default PricingCard;
