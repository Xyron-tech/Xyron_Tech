import { FaWhatsapp } from 'react-icons/fa'
import './WhatsAppFloat.css'

const WHATSAPP_LINK =
  "https://wa.me/919626782279?text=Hello%20XyronTech,%20I'm%20interested%20in%20building%20a%20website."

const WhatsAppFloat = () => {
  return (
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-float"
      aria-label="Chat on WhatsApp"
    >
      <FaWhatsapp />
    </a>
  )
}

export default WhatsAppFloat;
