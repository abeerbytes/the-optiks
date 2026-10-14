# Noor Optics — Premium Eyewear Store (Vite + React)

## Run
```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # production build -> dist/
```

## 1. Change brand / WhatsApp / delivery
Everything is in `src/config.js` (name, WhatsApp number, delivery fee, free-delivery limit, store locations, social links).

## 3. About & Contact content
Placeholder text lives in `src/data/siteContent.js` (About story, values, steps, FAQs) and
`src/config.js` (phone, email, hours, addresses). Replace with your real details before launch.

## Categories (fully automatic)
Categories, genders and colours shown in the navbar, footer, homepage tiles, homepage tabs and
the Products filters are all generated from `src/data/products.js` — add a new `category` or
`gender` value to a product and it appears everywhere on its own. Optional per-category cover
photo/description: edit `categoryDetails` at the top of `products.js`.

### Homepage "Shop by category" images
This section pairs a Men/Women card per category automatically (or one wide card for a
category with a single gender, e.g. Kids). It doesn't use product photos — each card looks for
a placeholder file at:
```
public/images/category-<category>-<gender>.jpg   e.g. category-eyeglasses-men.jpg
public/images/category-<category>.jpg             e.g. category-kids.jpg   (single-gender category)
```
Until that file exists, the card shows the site's neutral placeholder. Just drop your photo in
at the matching path — add a new category/gender in `products.js` and its row (and expected
file name) appears automatically, no code change needed. To use a different path or file name
instead, set it in `categoryDetails` in `products.js`:
```js
Sunglasses: { images: { Men: "/images/my-photo.jpg", Women: "/images/other.jpg" } }
```

## 2. Add a product (only 2 steps)
1. Put the image in `public/images/` (e.g. `glasses-13.jpg`).
2. Copy one object in `src/data/products.js`, give it a **new unique `id`**.

Filters, categories, product page, cart, checkout and WhatsApp message all update automatically.
Categories/genders shown in the filter chips are generated from this file.
Replacing the fake images later = just overwrite the files with the same names.

## 3. Orders via website or WhatsApp

The checkout **Place order** button saves customer and order details to Google Sheets through the
customer order Apps Script API. The separate **Order via WhatsApp** button remains available as an
alternative. Product pages can add an item to the cart and proceed to checkout.

### Google Sheets setup

1. Create a Google Sheet for orders and copy its ID from the URL:
   `https://docs.google.com/spreadsheets/d/<SPREADSHEET_ID>/edit`
2. Paste the contents of `apps-script/Code.gs` into an Apps Script project and set
   `SPREADSHEET_ID` near the top of that file.
3. Run `setup()` once to create/update the `Orders` headers and approve spreadsheet and email access.
4. Deploy as a Web app with **Execute as: Me** and **Who has access: Anyone**.
5. Put the deployed `/exec` URL in `STORE_CONFIG.googleSheetApi` in `src/config.js`.
6. After Apps Script changes, deploy a new version. Website checkout only reports success after
   the API confirms that the order was saved. The local API performance changes take effect only
   after the updated `apps-script/Code.gs` is deployed. New orders are saved with `Confirmed`
   status; the appended `Confirmation Email Status` column records `Queued`, `Sending`, `Sent`, or
   `Failed`. An email failure does not undo or duplicate the saved order.

## 4. Deploy
Any static host. It is a single-page app, so unknown URLs must fall back to `index.html`
(already included: `vercel.json` for Vercel, `public/_redirects` for Netlify).

## SEO and Google setup

The production site origin is `STORE_CONFIG.siteUrl` in `src/config.js` (`https://theoptiks.pk`).
An optional `VITE_SITE_URL` build environment variable can override it for another deployment.
`npm run build` generates `dist/sitemap.xml` and `dist/robots.txt`; submit the deployed sitemap
URL to Google Search Console after deployment. Product pages include Product and breadcrumb
structured data, while cart, checkout, missing-product and non-canonical search/filter URLs are
marked `noindex`.

This is a client-rendered single-page app. Google can render its page content, but unknown routes
currently use the SPA fallback and return the app shell; they may return HTTP 200 instead of a
true 404 response. A server-rendered or pre-rendered deployment is needed to return route-specific
HTTP status codes and metadata in the initial HTML.

Google Analytics is not enabled by default: configure it only after creating a GA4 property and
deciding how the site should handle analytics consent and its privacy notice. No measurement ID is
stored in this project.

## Structure
```
src/App.jsx                  pages, navbar, cart, checkout
src/styles.css               design tokens + responsive CSS
src/data/products.js         ALL products
src/config.js                ALL store settings
src/utils.js                 price format + totals (single source)
src/services/orderService.js website order submission + WhatsApp messages
apps-script/Code.gs          customer order API Apps Script source
```
