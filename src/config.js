// ============================================================
//  Store configuration — the ONLY place to change brand details
// ============================================================
export const STORE_CONFIG = {
  name: "The Optiks",                  // <-- your brand name
  siteUrl: "https://theoptiks.pk",
  whatsapp: "923329999773",            // country code + number, digits only
  currency: "PKR",
  // Public customer order API deployment URL.
  googleSheetApi: "https://script.google.com/macros/s/AKfycbzFO4SW3brMdsvv3-wOp8uhpNV4DSxHvCfvXT0In1dMEvyxoPtMaHnQv5D4Mb7aXJ2l/exec",

  // Delivery fee (used by cart, checkout and WhatsApp messages)
  deliveryFee: 250,

  // Contact details (placeholder — replace with real ones)
  phone: "+92 332 9999773",
  email: "theoptiks.store@gmail.com",
  hours: "Monday to Saturday, 11am – 9pm",
  address: "Shop No. 16, Adam Arcade, Shaheed-e-Millat Road, Karachi.",

  // Set verified profile URLs to show social links in the footer.
  instagram: "",
  facebook: "",

  // "Visit our store" section — edit / add / remove freely
  locations: [
    { city: "", area: "", address: "Shop No. 16, Adam Arcade, Shaheed-e-Millat Road, Karachi." },
  ],
};
