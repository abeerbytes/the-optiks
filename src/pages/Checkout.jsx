import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Check, MessageCircle, Truck } from "lucide-react";
import { STORE_CONFIG } from "../config";
import { formatPrice } from "../utils";
import { ORDER_ERROR_MESSAGE, buildCartWhatsAppUrl, submitOrder } from "../services/orderService";
import { useCart } from "../context/CartContext";
import usePageMeta from "../hooks/usePageMeta";
import EmptyState from "../components/EmptyState";
import Img from "../components/Img";

const PK_MOBILE = /^(?:\+92|0092|92|0)?3\d{9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const stripPhone = (v) => v.replace(/[\s-]/g, "");

function validate(v) {
  const e = {};
  if (v.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!v.email.trim()) e.email = "Please enter your email address.";
  else if (!EMAIL_RE.test(v.email.trim())) e.email = "Enter a valid email address.";
  if (!v.phone.trim()) e.phone = "Please enter your phone number.";
  else if (!PK_MOBILE.test(stripPhone(v.phone))) e.phone = "Enter a valid mobile number, e.g. 0300 1234567.";
  if (v.whatsapp.trim() && !PK_MOBILE.test(stripPhone(v.whatsapp)))
    e.whatsapp = "Enter a valid WhatsApp number, e.g. 0300 1234567.";
  if (v.address.trim().length < 8) e.address = "Please enter your complete address.";
  if (!v.city.trim()) e.city = "Please enter your city.";
  return e;
}

function Field({ id, label, required, error, children }) {
  return (
    <div className={error ? "field has-error" : "field"}>
      <label htmlFor={id}>
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-error`} className="field-error">
          {error}
        </p>
      )}
    </div>
  );
}

function Steps({ current }) {
  const steps = ["Cart", "Details", "Confirmation"];
  return (
    <ol className="steps" aria-label="Checkout progress">
      {steps.map((step, index) => (
        <li key={step} className={index < current ? "done" : index === current ? "current" : ""} aria-current={index === current ? "step" : undefined}>
          <span className="step-dot">{index < current ? <Check size={14} aria-hidden="true" /> : index + 1}</span>
          {step}
        </li>
      ))}
    </ol>
  );
}

const EMPTY_FORM = { name: "", email: "", phone: "", whatsapp: "", address: "", city: "", notes: "" };

export default function Checkout() {
  usePageMeta(`Checkout | ${STORE_CONFIG.name}`, "Enter your delivery details to place your order.", { noIndex: true });
  const { lines, totals, clearCart } = useCart();
  const [values, setValues] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [emailFailed, setEmailFailed] = useState(false);
  const submittingRef = useRef(false);
  const confirmRef = useRef(null);

  useEffect(() => {
    if (confirmed) confirmRef.current?.focus();
  }, [confirmed]);

  if (confirmed) {
    return (
      <div className="container page">
        <div className="empty confirm" role="status">
          <h1 ref={confirmRef} tabIndex={-1}>Order placed successfully!</h1>
          {emailFailed && (
            <p className="field-error" role="status">
              Your order was saved, but we couldn't send the confirmation email.
            </p>
          )}
          <Link to="/products" className="btn btn-primary">Shop now</Link>
        </div>
      </div>
    );
  }

  if (!lines.length) {
    return (
      <div className="container page">
        <EmptyState
          title="Your cart is empty"
          text="Add a frame to your cart before checking out."
          to="/products"
          cta="Shop products"
        />
      </div>
    );
  }

  const onChange = (e) => {
    const { name, value } = e.target;
    setValues((v) => ({ ...v, [name]: value }));
    if (errors[name]) setErrors((er) => ({ ...er, [name]: undefined }));
  };
  const onBlur = (e) => {
    const { name } = e.target;
    setErrors((er) => ({ ...er, [name]: validate(values)[name] }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (submittingRef.current) return;
    const found = validate(values);
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      document.getElementById(`f-${firstBad}`)?.focus();
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setServerError("");
    try {
      const result = await submitOrder({ customer: values, lines });
      clearCart();
      setEmailFailed(result.emailSent === false);
      setConfirmed(true);
    } catch (error) {
      console.error("Order failed:", error);
      setServerError(error instanceof Error && error.message ? error.message : ORDER_ERROR_MESSAGE);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const onWhatsAppOrder = () => {
    const found = validate(values);
    setErrors(found);
    const firstBad = Object.keys(found)[0];
    if (firstBad) {
      document.getElementById(`f-${firstBad}`)?.focus();
      return;
    }
    window.open(buildCartWhatsAppUrl(lines, values), "_blank", "noopener,noreferrer");
  };

  const input = (name, extra = {}) => ({
    id: `f-${name}`,
    name,
    value: values[name],
    onChange,
    onBlur,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `f-${name}-error` : undefined,
    ...extra,
  });

  return (
    <div className="container page">
      <header className="page-head">
        <h1 className="page-title">Checkout</h1>
      </header>
      <Steps current={1} />
      <div className="checkout-layout">
        <form id="checkout-form" className="form" onSubmit={onSubmit} noValidate>
          <fieldset>
            <legend>Contact</legend>
            <Field id="f-name" label="Full name" required error={errors.name}>
              <input {...input("name", { type: "text", autoComplete: "name" })} />
            </Field>
            <Field id="f-email" label="Email address" required error={errors.email}>
              <input {...input("email", { type: "email", inputMode: "email", autoComplete: "email", placeholder: "you@example.com" })} />
            </Field>
            <div className="field-row">
              <Field id="f-phone" label="Phone number" required error={errors.phone}>
                <input {...input("phone", { type: "tel", inputMode: "tel", autoComplete: "tel", placeholder: "0300 1234567" })} />
              </Field>
              <Field id="f-whatsapp" label="WhatsApp number" error={errors.whatsapp}>
                <input {...input("whatsapp", { type: "tel", inputMode: "tel", placeholder: "Optional" })} />
              </Field>
            </div>
          </fieldset>

          <fieldset>
            <legend>Delivery</legend>
            <Field id="f-address" label="Complete address" required error={errors.address}>
              <textarea {...input("address", { rows: 3, autoComplete: "street-address" })} />
            </Field>
            <Field id="f-city" label="City" required error={errors.city}>
              <input {...input("city", { type: "text", autoComplete: "address-level2" })} />
            </Field>
            <Field id="f-notes" label="Order notes">
              <textarea {...input("notes", { rows: 2, placeholder: "Anything we should know? (optional)" })} />
            </Field>
            <p className="delivery-note">
              <Truck size={18} strokeWidth={1.5} aria-hidden="true" />
              <span>
                We deliver across Pakistan. Standard delivery is {formatPrice(STORE_CONFIG.deliveryFee)}. Our team will contact you to confirm your order.
              </span>
            </p>
            
          </fieldset>
        </form>

        <aside className="summary" aria-labelledby="co-sum">
          <h2 id="co-sum">Order summary</h2>
          <ul className="co-lines">
            {lines.map(({ product, quantity }) => (
              <li key={product.id}>
                <div className="co-thumb">
                  <Img src={product.image} alt="" />
                  <span className="co-qty" aria-hidden="true">{quantity}</span>
                </div>
                <div>
                  <p className="co-name">{product.name}</p>
                  <p className="muted">Qty: {quantity}</p>
                </div>
                <p className="co-price">{formatPrice(product.price * quantity)}</p>
              </li>
            ))}
          </ul>
          <dl className="sum-rows">
            <div><dt>Subtotal</dt><dd>{formatPrice(totals.subtotal)}</dd></div>
            <div><dt>Delivery</dt><dd>{totals.delivery ? formatPrice(totals.delivery) : "Free"}</dd></div>
            <div className="sum-total"><dt>Total</dt><dd>{formatPrice(totals.total)}</dd></div>
          </dl>

          {serverError && (
            <div className="alert" role="alert">
              <p>{serverError}</p>
            </div>
          )}

          <button type="submit" form="checkout-form" className="btn btn-primary btn-block" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" aria-hidden="true" /> Placing order…
              </>
            ) : (
              "Place order"
            )}
          </button>
          <button type="button" className="btn btn-whatsapp btn-block" onClick={onWhatsAppOrder} disabled={submitting}>
            <MessageCircle size={18} aria-hidden="true" /> Order via WhatsApp
          </button>
          <Link to="/cart" className="link-btn center-btn">Back to cart</Link>
        </aside>
      </div>
    </div>
  );
}
