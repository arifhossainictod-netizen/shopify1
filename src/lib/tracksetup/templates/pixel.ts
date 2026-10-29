/**
 * Shopify Custom Pixel — runs entirely inside Shopify's Customer Events
 * sandbox. Self-contained: it boots the web GTM container into the sandbox
 * window (web/hybrid mode) and beacons payloads to the sGTM tagging server
 * (server/hybrid mode). No theme.liquid edits required.
 */
export function buildCustomPixel(): string {
  return `/* ============================================================
 * TrackSetup Pro — Shopify Custom Pixel (single-file install)
 * Store     : {{STORE_NAME}} ({{MYSHOPIFY_DOMAIN}})
 * Mode      : {{MODE}}
 * Generated : {{GENERATED_AT}} · engine v{{PACKAGE_VERSION}}
 *
 * INSTALL (≈ 60 seconds):
 *   Shopify Admin → Settings → Customer events → Add custom pixel
 *   → name it "TrackSetup Pro" → paste THIS ENTIRE FILE
 *   → Save → Connect.
 *
 * WHAT IT DOES:
 *   WEB mode    : injects your GTM container {{WEB_GTM_ID}} into this
 *                 sandbox and pushes normalized tsp.* events into
 *                 {{DATA_LAYER_NAME}} — your gtm-web.json tags fire here.
 *   SERVER mode : beacons the same payloads to your tagging server
 *                 {{TAGGING_SERVER_URL}}/{{TRANSPORT_PATH}} for sGTM.
 *   HYBRID      : both, with a shared event_id so platforms dedupe.
 * ============================================================ */
(function () {
  'use strict';

  if (typeof analytics === 'undefined') {
    try { console.warn('[tsp] idle — not inside a Customer Events sandbox'); } catch (_) {}
    return;
  }

  var CONFIG = {
    mode: '{{MODE}}',
    webGtmId: '{{WEB_GTM_ID}}',
    dlName: '{{DATA_LAYER_NAME}}',
    transport: '{{TAGGING_SERVER_URL}}',
    path: '/{{TRANSPORT_PATH}}',
    currency: '{{CURRENCY}}',
    hashUserData: {{HASH_USER_DATA}},
    consentMode: {{CONSENT_MODE}},
    platforms: {{PLATFORM_IDS_JSON}}
  };

  var EVENT_MAP = {{EVENT_MAP_JSON}};
  var DL = window[CONFIG.dlName] = window[CONFIG.dlName] || [];

  /* 1 · Web container boot (inside this sandbox) ------------------------ */
  function bootWeb() {
    if (CONFIG.mode === 'SERVER' || !CONFIG.webGtmId || !document) return;
    if (CONFIG.consentMode) {
      DL.push({
        event: 'tsp.consent_default',
        consent: {
          ad_storage: 'denied',
          ad_user_data: 'denied',
          ad_personalization: 'denied',
          analytics_storage: 'denied',
          wait_for_update: 500
        }
      });
    }
    DL.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtm.js?id=' +
      encodeURIComponent(CONFIG.webGtmId) +
      (CONFIG.dlName !== 'dataLayer' ? '&l=' + encodeURIComponent(CONFIG.dlName) : '');
    var f = document.getElementsByTagName('script')[0];
    var parent = (f && f.parentNode) || document.head || document.documentElement;
    parent.insertBefore(s, f || null);
  }

  function rid() {
    return 'xxxxxxxx4xyz'.replace(/[xy]/g, function (c) {
      var r = (Math.random() * 16) | 0;
      return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
    }) + '-' + Date.now().toString(36);
  }

  function findMap(shopifyName) {
    for (var i = 0; i < EVENT_MAP.length; i++) {
      if (EVENT_MAP[i].shopify === shopifyName) return EVENT_MAP[i];
    }
    return null;
  }

  function num(x) {
    var n = Number(x);
    return isFinite(n) ? n : undefined;
  }

  /* 2 · Normalization — Shopify event → GA4-style ecommerce ------------- */
  function toItems(evt) {
    var out = [];
    var d = (evt && evt.data) || {};
    var i, li;
    if (d.checkout && d.checkout.lineItems) {
      for (i = 0; i < d.checkout.lineItems.length; i++) {
        li = d.checkout.lineItems[i];
        out.push({
          item_id: li.variant ? String(li.variant.sku || li.variant.id || li.id) : String(li.id || ''),
          item_name: li.title || '',
          item_category: li.variant && li.variant.product ? li.variant.product.productType : undefined,
          price: li.variant && li.variant.price ? num(li.variant.price.amount) : undefined,
          quantity: li.quantity || 1
        });
      }
      return out;
    }
    if (d.cartLine) {
      out.push({
        item_id: d.cartLine.merchandise ? String(d.cartLine.merchandise.sku || d.cartLine.merchandise.id || '') : '',
        item_name: d.cartLine.merchandise && d.cartLine.merchandise.product ? d.cartLine.merchandise.product.title : '',
        price: d.cartLine.cost && d.cartLine.cost.totalAmount ? num(d.cartLine.cost.totalAmount.amount) : undefined,
        quantity: d.cartLine.quantity || 1
      });
      return out;
    }
    if (d.productVariant) {
      out.push({
        item_id: String(d.productVariant.sku || d.productVariant.id || ''),
        item_name: d.productVariant.product ? d.productVariant.product.title : d.productVariant.title || '',
        item_category: d.productVariant.product ? d.productVariant.product.type : undefined,
        price: d.productVariant.price ? num(d.productVariant.price.amount) : undefined,
        quantity: 1
      });
    }
    return out;
  }

  function payloadValue(evt) {
    var d = (evt && evt.data) || {};
    if (d.checkout && d.checkout.totalPrice) return num(d.checkout.totalPrice.amount);
    if (d.cartLine && d.cartLine.cost && d.cartLine.cost.totalAmount) return num(d.cartLine.cost.totalAmount.amount);
    if (d.productVariant && d.productVariant.price) return num(d.productVariant.price.amount);
    return undefined;
  }

  function payloadCurrency(evt) {
    var d = (evt && evt.data) || {};
    if (d.checkout && d.checkout.currencyCode) return d.checkout.currencyCode;
    if (d.cartLine && d.cartLine.cost && d.cartLine.cost.totalAmount) return d.cartLine.cost.totalAmount.currencyCode;
    return CONFIG.currency;
  }

  function userData(evt) {
    if (CONFIG.hashUserData) return { hashed: true }; // sGTM hashes em/ph with SHA-256
    var co = ((evt && evt.data) || {}).checkout || {};
    var out = {};
    if (co.email) out.email = co.email;
    if (co.phone) out.phone = co.phone;
    if (co.shippingAddress && co.shippingAddress.countryCode) out.country = co.shippingAddress.countryCode;
    return out;
  }

  /* 3 · Server beacon ---------------------------------------------------- */
  function beacon(payload) {
    if (CONFIG.mode === 'WEB' || !CONFIG.transport) return;
    var url = CONFIG.transport + CONFIG.path;
    var body = JSON.stringify(payload);
    try {
      if (typeof browser !== 'undefined' && browser.sendBeacon) {
        browser.sendBeacon(url, body);
        return;
      }
      if (typeof fetch === 'function') {
        fetch(url, {
          method: 'POST',
          keepalive: true,
          credentials: 'omit',
          headers: { 'content-type': 'application/json' },
          body: body
        });
      }
    } catch (_) {}
  }

  /* 4 · Emit: one Shopify event → dataLayer + tagging server ------------- */
  function emit(shopifyName, evt) {
    var map = findMap(shopifyName);
    if (!map) return;
    var ga4Name = map.ga4 || map.id;
    var items = toItems(evt);
    var value = payloadValue(evt);
    var currency = payloadCurrency(evt);
    var co = ((evt && evt.data) || {}).checkout || {};
    var eventId = (evt && evt.clientId) || rid();
    var transactionId = co.order && co.order.id ? 'order_' + co.order.id : undefined;

    if (CONFIG.mode !== 'SERVER') {
      DL.push({
        event: 'tsp.' + ga4Name,
        ecommerce: {
          items: items,
          value: value || 0,
          currency: currency,
          transaction_id: transactionId
        },
        user: userData(evt),
        event_id: eventId,
        _tsp: true
      });
    }

    beacon({
      event_name: ga4Name,
      event_id: eventId,
      timestamp: new Date().toISOString(),
      source_url: evt && evt.context && evt.context.window ? evt.context.window.location.href : '',
      ecommerce: { items: items, value: value || 0, currency: currency, transaction_id: transactionId },
      user_data: userData(evt),
      consent: { analytics_storage: 'granted', ad_storage: 'granted' },
      tsp: { v: '{{PACKAGE_VERSION}}' }
    });
  }

  for (var k = 0; k < EVENT_MAP.length; k++) {
    (function (m) {
      try {
        analytics.subscribe(m.shopify, function (evt) { emit(m.shopify, evt); });
      } catch (_) {}
    })(EVENT_MAP[k]);
  }

  bootWeb();
})();
`;
}
