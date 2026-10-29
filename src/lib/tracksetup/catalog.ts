export interface PlatformField {
  key: string;
  label: string;
  placeholder: string;
  helper?: string;
  required?: boolean;
  secret?: boolean;
  pattern?: string;
  patternHint?: string;
  serverNote?: string;
}

export interface Platform {
  id: string;
  name: string;
  short: string;
  color: string;
  blurb: string;
  serverLabel: string;
  fields: PlatformField[];
}

export const PLATFORMS: Platform[] = [
  {
    id: "ga4",
    name: "Google Analytics 4",
    short: "GA4",
    color: "#ff8b05",
    blurb: "Measurement Protocol + gtag stream for behavioral analytics.",
    serverLabel: "GA4 client claims the transport endpoint",
    fields: [
      {
        key: "measurementId",
        label: "Measurement ID",
        placeholder: "G-XXXXXXXXXX",
        required: true,
        pattern: "^G-[A-Z0-9]{6,}$",
        patternHint: "Looks like G-9XK2M4PLRD",
        helper: "Admin → Data Streams → Web",
      },
      {
        key: "apiSecret",
        label: "Measurement Protocol secret",
        placeholder: "mp_secret_…",
        secret: true,
        serverNote: "Enables GA4 Measurement Protocol from the server container.",
        helper: "Data stream → Measurement Protocol API secrets",
      },
    ],
  },
  {
    id: "meta",
    name: "Meta (Facebook & Instagram)",
    short: "Meta",
    color: "#1877f2",
    blurb: "Browser pixel + Conversions API for deduplicated match quality.",
    serverLabel: "CAPI tag hashes & forwards user_data",
    fields: [
      {
        key: "pixelId",
        label: "Pixel ID",
        placeholder: "7382019450261",
        required: true,
        pattern: "^\\d{8,}$",
        patternHint: "Numeric, e.g. 7382019450261",
        helper: "Events Manager → Data sources",
      },
      {
        key: "accessToken",
        label: "CAPI access token",
        placeholder: "EAAG…",
        secret: true,
        serverNote: "Required for server-side Conversions API.",
        helper: "Events Manager → Settings → Generate access token",
      },
      {
        key: "testEventCode",
        label: "Test event code",
        placeholder: "TEST12345",
        helper: "Optional — visible in Events Manager → Test events",
      },
    ],
  },
  {
    id: "tiktok",
    name: "TikTok",
    short: "TikTok",
    color: "#28e6d9",
    blurb: "Pixel + Events API for lower-funnel campaign optimization.",
    serverLabel: "Events API 2.0 server forwarding",
    fields: [
      {
        key: "pixelId",
        label: "Pixel ID",
        placeholder: "C4A1B2C3D4E5F6",
        required: true,
        pattern: "^[A-Z0-9]{10,}$",
        patternHint: "Alphanumeric, 10+ chars",
        helper: "TikTok Ads Manager → Tools → Events",
      },
      {
        key: "accessToken",
        label: "Events API token",
        placeholder: "tk_…",
        secret: true,
        serverNote: "Required for TikTok Events API 2.0.",
      },
    ],
  },
  {
    id: "pinterest",
    name: "Pinterest",
    short: "Pin",
    color: "#e60023",
    blurb: "Tag + Conversions API for catalog and shopping campaigns.",
    serverLabel: "Conversions API v5 endpoint",
    fields: [
      {
        key: "tagId",
        label: "Tag ID",
        placeholder: "2612345678901",
        required: true,
        pattern: "^\\d{13}$",
        patternHint: "13-digit tag id",
        helper: "Ads → Conversions → Tag management",
      },
      {
        key: "accessToken",
        label: "API access token",
        placeholder: "pina_…",
        secret: true,
        serverNote: "Required for Pinterest Conversions API.",
      },
    ],
  },
  {
    id: "snapchat",
    name: "Snapchat",
    short: "Snap",
    color: "#fffc00",
    blurb: "Snap Pixel + Conversions API for AR and app campaigns.",
    serverLabel: "CAPI v3 server forwarding",
    fields: [
      {
        key: "pixelId",
        label: "Pixel ID",
        placeholder: "a1b2c3d4-…-uuid",
        required: true,
        pattern: "^[a-f0-9-]{36}$",
        patternHint: "UUID format",
        helper: "Snap Ads → Events → Pixel",
      },
    ],
  },
  {
    id: "googleads",
    name: "Google Ads",
    short: "Ads",
    color: "#34a853",
    blurb: "Enhanced conversions via gtag for Search & PMax bidding.",
    serverLabel: "Offline conversion uploads (optional)",
    fields: [
      {
        key: "conversionId",
        label: "Conversion ID",
        placeholder: "AW-123456789",
        required: true,
        pattern: "^AW-\\d{8,}$",
        patternHint: "AW-123456789",
      },
      {
        key: "conversionLabel",
        label: "Purchase label",
        placeholder: "abcDeFgHiJkLmNoP",
        helper: "Only needed for the purchase conversion action",
      },
    ],
  },
];

export const platformById = (id: string) => PLATFORMS.find((p) => p.id === id);

export interface TrackingEvent {
  id: string;
  label: string;
  shopify: string;
  ga4: string | null;
  meta: string | null;
  tiktok: string | null;
  pinterest: string | null;
  desc: string;
  group: "funnel" | "engagement";
  recommended?: boolean;
}

export const EVENTS: TrackingEvent[] = [
  {
    id: "page_viewed",
    label: "Page View",
    shopify: "page_viewed",
    ga4: "page_view",
    meta: "PageView",
    tiktok: "Pageview",
    pinterest: "pagevisit",
    desc: "Every storefront page render with full page context.",
    group: "engagement",
    recommended: true,
  },
  {
    id: "product_viewed",
    label: "View Item",
    shopify: "product_viewed",
    ga4: "view_item",
    meta: "ViewContent",
    tiktok: "ViewContent",
    pinterest: "viewcategory",
    desc: "PDP impression with product id, price and currency.",
    group: "funnel",
    recommended: true,
  },
  {
    id: "search_submitted",
    label: "Search",
    shopify: "search_submitted",
    ga4: "search",
    meta: "Search",
    tiktok: "Search",
    pinterest: "search",
    desc: "Onsite search terms for merchandising intelligence.",
    group: "engagement",
  },
  {
    id: "product_added_to_cart",
    label: "Add to Cart",
    shopify: "product_added_to_cart",
    ga4: "add_to_cart",
    meta: "AddToCart",
    tiktok: "AddToCart",
    pinterest: "addtocart",
    desc: "Line-level adds with variant sku, quantity and value.",
    group: "funnel",
    recommended: true,
  },
  {
    id: "product_removed_from_cart",
    label: "Remove from Cart",
    shopify: "product_removed_from_cart",
    ga4: "remove_from_cart",
    meta: null,
    tiktok: "RemoveFromCart",
    pinterest: null,
    desc: "Cart pruning signal for creative and pricing analysis.",
    group: "funnel",
  },
  {
    id: "cart_viewed",
    label: "View Cart",
    shopify: "cart_viewed",
    ga4: "view_cart",
    meta: "ViewCart",
    tiktok: "ViewCart",
    pinterest: "cart",
    desc: "Cart page render with the entire line item array.",
    group: "funnel",
  },
  {
    id: "checkout_started",
    label: "Begin Checkout",
    shopify: "checkout_started",
    ga4: "begin_checkout",
    meta: "InitiateCheckout",
    tiktok: "InitiateCheckout",
    pinterest: "initiatecheckout",
    desc: "Checkout funnel entry with order subtotal.",
    group: "funnel",
    recommended: true,
  },
  {
    id: "checkout_contact_info_submitted",
    label: "Add Shipping Info",
    shopify: "checkout_contact_info_submitted",
    ga4: "add_shipping_info",
    meta: "AddShippingInfo",
    tiktok: "AddShippingInfo",
    pinterest: "addshippinginfo",
    desc: "Contact capture milestone inside checkout.",
    group: "funnel",
  },
  {
    id: "payment_info_submitted",
    label: "Add Payment Info",
    shopify: "payment_info_submitted",
    ga4: "add_payment_info",
    meta: "AddPaymentInfo",
    tiktok: "AddPaymentInfo",
    pinterest: "addpaymentinfo",
    desc: "Payment milestone — strong purchase intent signal.",
    group: "funnel",
  },
  {
    id: "checkout_completed",
    label: "Purchase",
    shopify: "checkout_completed",
    ga4: "purchase",
    meta: "Purchase",
    tiktok: "PlaceAnOrder",
    pinterest: "checkout",
    desc: "Conversion with order id, revenue, tax and items.",
    group: "funnel",
    recommended: true,
  },
];

export const eventById = (id: string) => EVENTS.find((e) => e.id === id);

export const CURRENCIES = ["USD", "EUR", "GBP", "CAD", "AUD", "JPY", "INR", "BRL"];

export const CMP_OPTIONS: { id: string; label: string; desc: string }[] = [
  { id: "none", label: "None", desc: "Consent defaults only — you wire the banner yourself." },
  { id: "shopify", label: "Shopify Customer Privacy", desc: "Reads window.Shopify.customerPrivacy signals." },
  { id: "cookiebot", label: "Cookiebot", desc: "Listens for CookiebotOnConsentReady events." },
  { id: "onetrust", label: "OneTrust", desc: "Reads OnetrustActiveGroups categories." },
];
