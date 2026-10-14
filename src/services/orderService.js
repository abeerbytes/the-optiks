import { STORE_CONFIG } from "../config";
import { calcTotals, formatPrice } from "../utils";

export const ORDER_ERROR_MESSAGE =
  "Something went wrong while placing your order. Please try again in a moment.";

export const PAYMENT_METHOD = "Cash on Delivery";

const REQUEST_TIMEOUT_MS = 30000;
const MAX_ORDER_ATTEMPTS = 2;
const RESPONSE_CHANNEL = "the-optiks-order-response";

function createRequestId() {
  const randomId = window.crypto?.randomUUID
    ? window.crypto.randomUUID()
    : Array.from(window.crypto.getRandomValues(new Uint8Array(16)))
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
  return `ordreq-${randomId}`;
}

function submitToAppsScript(url, payload) {
  const requestId = createRequestId();
  const request = { action: "createOrder", requestId, ...payload };

  const submitAttempt = (attempt) => new Promise((resolve, reject) => {
    const frame = document.createElement("iframe");
    frame.name = `order-response-${requestId}-${attempt}`;
    frame.title = "Order submission response";
    frame.hidden = true;
    frame.referrerPolicy = "no-referrer";

    const form = document.createElement("form");
    form.method = "POST";
    form.action = url;
    form.target = frame.name;
    form.hidden = true;

    const field = document.createElement("input");
    field.type = "hidden";
    field.name = "payload";
    field.value = JSON.stringify(request);
    form.appendChild(field);

    let timeout;
    const cleanup = () => {
      clearTimeout(timeout);
      window.removeEventListener("message", onMessage);
      form.remove();
      frame.remove();
    };
    const onMessage = (event) => {
      const message = event.data;
      if (
        !message ||
        message.channel !== RESPONSE_CHANNEL ||
        message.requestId !== requestId
      ) {
        return;
      }
      cleanup();
      if (message.response?.success && message.response.orderId) {
        resolve(message.response);
      } else {
        const error = new Error(message.response?.message || "The order was not accepted.");
        error.retrySameRequest = Boolean(message.response?.retrySameRequest);
        reject(error);
      }
    };

    window.addEventListener("message", onMessage);
    timeout = window.setTimeout(() => {
      cleanup();
      const error = new Error("The order response timed out.");
      error.retrySameRequest = true;
      reject(error);
    }, REQUEST_TIMEOUT_MS);
    document.body.append(frame, form);
    try {
      form.submit();
    } catch (error) {
      cleanup();
      error.retrySameRequest = true;
      reject(error);
    }
  });

  const retry = (attempt) => submitAttempt(attempt).catch((error) => {
    if (!error.retrySameRequest || attempt >= MAX_ORDER_ATTEMPTS) {
      if (error.retrySameRequest) {
        throw new Error(ORDER_ERROR_MESSAGE);
      }
      throw error;
    }
    return new Promise((resolve) => window.setTimeout(resolve, 700 * attempt))
      .then(() => retry(attempt + 1));
  });

  return retry(1);
}

export async function submitOrder({ customer, lines }) {
  const url = String(STORE_CONFIG.googleSheetApi || "").trim();
  if (!/^https:\/\/script\.google\.com\/macros\/s\/[^/]+\/exec(?:\?.*)?$/.test(url)) {
    throw new Error("Order endpoint is not configured. Add the deployed Apps Script /exec URL in src/config.js.");
  }
  if (!Array.isArray(lines) || !lines.length) {
    throw new Error("Your cart is empty.");
  }

  const { subtotal, delivery, total } = calcTotals(lines);
  const payload = {
    customerName: customer.name.trim(),
    email: customer.email.trim(),
    phone: customer.phone.trim(),
    whatsapp: (customer.whatsapp || "").trim(),
    address: customer.address.trim(),
    city: customer.city.trim(),
    notes: (customer.notes || "").trim(),
    paymentMethod: PAYMENT_METHOD,
    subtotal,
    deliveryFee: delivery,
    total,
    items: lines.map(({ product, quantity }) => ({
      productId: product.id,
      productName: product.name,
      quantity,
      price: product.price,
    })),
  };

  return submitToAppsScript(url, payload);
}

const waUrl = (text) =>
  `https://wa.me/${STORE_CONFIG.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(text)}`;

export function whatsappSupportUrl() {
  return waUrl("Assalam o Alaikum, I need some help with an order.");
}

export function buildProductWhatsAppUrl(product, quantity = 1) {
  const text = [
    "Assalam o Alaikum,",
    "",
    "I would like to order:",
    "",
    `Product: ${product.name}`,
    `Product ID: ${product.id}`,
    `Price: ${formatPrice(product.price)}`,
    `Quantity: ${quantity}`,
    "",
    "Name:",
    "Phone:",
    "Address:",
    "City:",
    "",
    "Please confirm my order.",
  ].join("\n");
  return waUrl(text);
}

export function buildCartWhatsAppUrl(lines, customer = {}) {
  const { delivery, total } = calcTotals(lines);
  const items = lines.flatMap((line, index) => [
    `${index + 1}. ${line.product.name} (ID: ${line.product.id})`,
    `Qty: ${line.quantity}`,
    `Price: ${formatPrice(line.product.price)}`,
    "",
  ]);
  const text = [
    "Assalam o Alaikum,",
    "",
    "I would like to place an order:",
    "",
    ...items,
    ...(delivery ? [`Delivery: ${formatPrice(delivery)}`] : []),
    `Total: ${formatPrice(total)}`,
    "",
    `Name: ${customer.name || ""}`.trimEnd(),
    `Email: ${customer.email || ""}`.trimEnd(),
    `Phone: ${customer.phone || ""}`.trimEnd(),
    `WhatsApp: ${customer.whatsapp || ""}`.trimEnd(),
    `Address: ${customer.address || ""}`.trimEnd(),
    `City: ${customer.city || ""}`.trimEnd(),
    `Order notes: ${customer.notes || ""}`.trimEnd(),
    "",
    "Please confirm my order.",
  ].join("\n");
  return waUrl(text);
}

export function buildContactWhatsAppUrl({ name, phone, message }) {
  return waUrl(
    [
      "Assalam o Alaikum,",
      "",
      message.trim(),
      "",
      `Name: ${name.trim()}`,
      `Phone: ${phone.trim()}`,
    ].join("\n")
  );
}
