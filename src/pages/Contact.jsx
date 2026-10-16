import { useState } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { STORE_CONFIG } from "../config";
import { contact } from "../data/siteContent";
import { buildContactWhatsAppUrl, whatsappSupportUrl } from "../services/orderService";
import usePageMeta from "../hooks/usePageMeta";
import SectionTitle from "../components/SectionTitle";

const PK_MOBILE = /^(?:\+92|0092|92|0)?3\d{9}$/;

export default function Contact() {
  usePageMeta(
    `Contact ${STORE_CONFIG.name} | Eyewear Orders in Pakistan`,
    `Contact ${STORE_CONFIG.name} about eyewear, orders, delivery or store information.`
  );

  const [values, setValues] = useState({ name: "", phone: "", message: "" });
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);

  const validate = (v) => {
    const e = {};
    if (v.name.trim().length < 2) e.name = "Please enter your name.";
    if (!v.phone.trim()) e.phone = "Please enter your phone number.";
    else if (!PK_MOBILE.test(v.phone.replace(/[\s-]/g, ""))) e.phone = "Enter a valid mobile number, e.g. 0300 1234567.";
    if (v.message.trim().length < 5) e.message = "Please write your message.";
    return e;
  };

  const onChange = (e) => {
    setValues((v) => ({ ...v, [e.target.name]: e.target.value }));
    setErrors((er) => ({ ...er, [e.target.name]: undefined }));
    setSent(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const found = validate(values);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) return document.getElementById(`c-${first}`)?.focus();
    window.open(buildContactWhatsAppUrl(values), "_blank", "noopener,noreferrer");
    setSent(true);
  };

  const field = (name) => ({
    id: `c-${name}`,
    name,
    value: values[name],
    onChange,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `c-${name}-error` : undefined,
  });

  const cards = [
    { icon: MessageCircle, title: "WhatsApp", text: "Fastest way to reach us", href: whatsappSupportUrl(), external: true },
    { icon: Phone, title: "Phone", text: STORE_CONFIG.phone, href: `tel:${STORE_CONFIG.phone.replace(/[^\d+]/g, "")}` },
    { icon: Mail, title: "Email", text: STORE_CONFIG.email, href: `mailto:${STORE_CONFIG.email}` },
    { icon: Clock, title: "Opening hours", text: STORE_CONFIG.hours },
  ];

  return (
    <>
      <header className="about-hero contact-hero">
        <div className="container">
          <h1>{contact.title}</h1>
          <p>{contact.intro}</p>
        </div>
      </header>

      <section className="container section contact-cards-wrap" aria-label="Contact options">
        <ul className="contact-cards">
          {cards.map(({ icon: Icon, title, text, href, external }) => (
            <li key={title}>
              <Icon size={26} strokeWidth={1.4} aria-hidden="true" />
              <h2>{title}</h2>
              {href ? (
                <a href={href} {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  {text}
                </a>
              ) : (
                <p>{text}</p>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="container section contact-main" aria-labelledby="msg-title">
        <div>
          <SectionTitle id="msg-title" align="left">Send us a message</SectionTitle>
          <form className="form" onSubmit={onSubmit} noValidate>
            <div className={errors.name ? "field has-error" : "field"}>
              <label htmlFor="c-name">Your name <span aria-hidden="true">*</span></label>
              <input type="text" autoComplete="name" {...field("name")} />
              {errors.name && <p id="c-name-error" className="field-error">{errors.name}</p>}
            </div>
            <div className={errors.phone ? "field has-error" : "field"}>
              <label htmlFor="c-phone">Phone number <span aria-hidden="true">*</span></label>
              <input type="tel" inputMode="tel" autoComplete="tel" placeholder="0300 1234567" {...field("phone")} />
              {errors.phone && <p id="c-phone-error" className="field-error">{errors.phone}</p>}
            </div>
            <div className={errors.message ? "field has-error" : "field"}>
              <label htmlFor="c-message">Message <span aria-hidden="true">*</span></label>
              <textarea rows={5} {...field("message")} />
              {errors.message && <p id="c-message-error" className="field-error">{errors.message}</p>}
            </div>
            <button type="submit" className="btn btn-primary">
              <MessageCircle size={18} aria-hidden="true" /> Send on WhatsApp
            </button>
            <p className="field-hint" role="status">
              {sent ? "WhatsApp opened with your message. Just press send." : "Your message opens in WhatsApp so you can send it to us directly."}
            </p>
          </form>
        </div>

        <div id="stores">
          <SectionTitle align="left" id="stores-title">Our Location</SectionTitle>
          <ul className="store-list">
            {STORE_CONFIG.locations.map((l) => (
              <li key={`${l.city}-${l.area}-${l.address}`}>
                <MapPin size={20} strokeWidth={1.5} aria-hidden="true" />
                <div>
                  {l.address && <p>{l.address}</p>}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section section-stone" aria-labelledby="faq-title">
        <div className="container faq-wrap">
          <SectionTitle id="faq-title">Common questions</SectionTitle>
          <div className="faq">
            {contact.faqs.map((f) => (
              <details key={f.q} className="acc">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
