import { MessageCircle } from "lucide-react";
import { whatsappSupportUrl } from "../services/orderService";

export default function WhatsAppFab() {
  return (
    <a
      className="fab"
      href={whatsappSupportUrl()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
    >
      <MessageCircle size={26} aria-hidden="true" />
    </a>
  );
}
