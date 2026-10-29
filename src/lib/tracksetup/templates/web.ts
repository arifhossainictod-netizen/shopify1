import { EVENTS, platformById } from "../catalog";
import type { WizardData } from "../types";

type GtmMap = { type: string; key: string; value: string };
type GtmList = { type: string; map: GtmMap[] };
interface GtmParam {
  type: string;
  key: string;
  value?: string;
  list?: GtmList[];
}
interface GtmEntity {
  [key: string]: unknown;
}

const tpl = (key: string, value: string): GtmParam => ({ type: "TEMPLATE", key, value });
const num = (key: string, value: string): GtmParam => ({ type: "INTEGER", key, value });
const bool = (key: string, value: boolean): GtmParam => ({ type: "BOOLEAN", key, value: value ? "true" : "false" });
const map = (pairs: [string, string][]): GtmList => ({
  type: "MAP",
  map: pairs.map(([k, v]) => ({ type: "TEMPLATE", key: k, value: v })),
});
const listParam = (key: string, entries: GtmList[]): GtmParam => ({ type: "LIST", key, list: entries });
const monitoring = (kind: "google" | "custom") => ({
  type: "MAP",
  map: [{ type: "TEMPLATE", key: "type", value: kind }],
});
const NOT_SET = { consentStatus: "NOT_SET" };

const ACC = "6000000001";
const CID = "7000000001";
const ALL_PAGES = "2147479553";
const INITIALIZATION = "2147479572";
const CONSENT_INIT = "2147479573";

const fp = () => Math.floor(Math.random() * 1e13).toString(16);

const mapParam = (name: string, value: string): GtmList =>
  map([
    ["name", name],
    ["value", value],
  ]);

export function buildWebContainer(data: WizardData): string {
  const selected = EVENTS.filter((e) => data.events.selected.includes(e.id));
  const platforms = data.destinations.platforms
    .map((id) => platformById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const variables: GtmEntity[] = [];
  const triggers: GtmEntity[] = [];
  const tags: GtmEntity[] = [];

  let vid = 4000;
  let tid = 2000;
  let gid = 5000;

  const dlVar = (name: string, dlName: string, setDefault = false, def = "") => {
    variables.push({
      accountId: ACC,
      containerId: CID,
      variableId: String(vid++),
      name,
      type: "v",
      parameter: [num("dataLayerVersion", "2"), bool("setDefaultValue", setDefault), tpl("name", dlName), ...(setDefault ? [tpl("defaultValue", def)] : [])],
      fingerprint: fp(),
    });
    return `{{${name}}}`;
  };

  const constVar = (name: string, value: string) => {
    variables.push({
      accountId: ACC,
      containerId: CID,
      variableId: String(vid++),
      name,
      type: "c",
      parameter: [tpl("value", value)],
      fingerprint: fp(),
    });
    return `{{${name}}}`;
  };

  dlVar("DLV - ecommerce.items", "ecommerce.items", true, "[]");
  dlVar("DLV - ecommerce.value", "ecommerce.value", true, "0");
  dlVar("DLV - ecommerce.currency", "ecommerce.currency", true, "{{CURRENCY}}");
  dlVar("DLV - ecommerce.transaction_id", "ecommerce.transaction_id");
  dlVar("DLV - user.email", "user.email", true, "");
  dlVar("DLV - consent.ad_storage", "consent.ad_storage", true, "denied");
  dlVar("DLV - consent.analytics_storage", "consent.analytics_storage", true, "denied");

  const ceTrigger = (eventName: string) => {
    const id = String(tid++);
    triggers.push({
      accountId: ACC,
      containerId: CID,
      triggerId: id,
      name: `CE — tsp.${eventName}`,
      type: "CUSTOM_EVENT",
      customEventFilter: [
        {
          type: "EQUALS",
          parameter: [
            { type: "TEMPLATE", key: "arg0", value: "{{_event}}" },
            { type: "TEMPLATE", key: "arg1", value: `tsp.${eventName}` },
          ],
        },
      ],
      fingerprint: fp(),
    });
    return id;
  };

  // ── Consent default tag ────────────────────────────────────────────────
  if (data.events.consentMode) {
    tags.push({
      accountId: ACC,
      containerId: CID,
      tagId: String(gid++),
      name: "TSP • Consent Defaults (v2)",
      type: "html",
      parameter: [
        tpl(
          "html",
          `<script>
(function () {
  var g = window.gtag || function(){ window['{{DATA_LAYER_NAME}}'].push(arguments); };
  g('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'denied',
    functionality_storage: 'granted',
    security_storage: 'granted',
    wait_for_update: 500
  });
  g('set', 'ads_data_redaction', true);
})();
</script>`,
        ),
        bool("supportDocumentWrite", false),
      ],
      firingTriggerId: [CONSENT_INIT],
      tagFiringOption: "ONCE_PER_EVENT",
      monitoringMetadata: monitoring("custom"),
      consentSettings: NOT_SET,
      fingerprint: fp(),
    });
  }

  for (const evt of selected) {
    const ceId = ceTrigger(evt.ga4 ?? evt.id);
    for (const p of platforms) {
      if (p.id === "ga4" && evt.ga4) {
        const mid = (data.destinations.credentials.ga4?.measurementId ?? "").trim() || "{{GA4_MEASUREMENT_ID}}";
        if (!variables.some((v) => v.name === "CONST - GA4 Measurement ID")) constVar("CONST - GA4 Measurement ID", mid);
        tags.push({
          accountId: ACC,
          containerId: CID,
          tagId: String(gid++),
          name: `GA4 • ${evt.label}`,
          type: "gaawe",
          parameter: [
            bool("sendEcommerceData", false),
            tpl("eventName", evt.ga4),
            tpl("measurementIdOverride", "{{CONST - GA4 Measurement ID}}"),
            listParam("eventParameters", [
              mapParam("items", "{{DLV - ecommerce.items}}"),
              mapParam("value", "{{DLV - ecommerce.value}}"),
              mapParam("currency", "{{DLV - ecommerce.currency}}"),
              ...(evt.id === "checkout_completed" ? [mapParam("transaction_id", "{{DLV - ecommerce.transaction_id}}")] : []),
            ]),
          ],
          firingTriggerId: [ceId === "2000" ? ALL_PAGES : ceId],
          tagFiringOption: "ONCE_PER_EVENT",
          monitoringMetadata: monitoring("google"),
          consentSettings: NOT_SET,
          fingerprint: fp(),
        });
      }

      if (p.id === "meta" && evt.meta) {
        if (!variables.some((v) => v.name === "CONST - Meta Pixel ID")) {
          constVar("CONST - Meta Pixel ID", (data.destinations.credentials.meta?.pixelId ?? "").trim() || "{{META_PIXEL_ID}}");
        }
        if (evt.id === "page_viewed") {
          tags.push(metaBase(data, gid++, ceId));
        } else {
          tags.push(metaEvent(evt.id, evt.meta, gid++, ceId));
        }
      }

      if (p.id === "tiktok" && evt.tiktok) {
        if (evt.id === "page_viewed") tags.push(ttqBase(data, gid++, ceId));
        else tags.push(ttqEvent(evt.tiktok, gid++, ceId));
      }

      if (p.id === "pinterest" && evt.pinterest) {
        if (evt.id === "page_viewed") tags.push(pinBase(data, gid++, ceId));
        else tags.push(pinEvent(evt.pinterest, gid++, ceId));
      }

      if (p.id === "snapchat") {
        if (evt.id === "page_viewed") tags.push(snapBase(data, gid++, ceId));
        else if (evt.ga4 === "purchase" || evt.id === "product_viewed" || evt.id === "product_added_to_cart" || evt.id === "checkout_started") {
          tags.push(snapEvent(evt.id, gid++, ceId));
        }
      }

      if (p.id === "googleads") {
        if (evt.id === "page_viewed") tags.push(awBase(data, gid++, ceId));
        if (evt.id === "checkout_completed") tags.push(awPurchase(data, gid++, ceId));
      }
    }
  }

  const consentNote = data.events.consentMode
    ? ` Consent Mode v2 defaults baked in (cmp: ${data.events.cmp.toUpperCase()}).`
    : "";

  const exportObj = {
    exportFormatVersion: 2,
    exportTime: "{{GENERATED_AT}}",
    containerVersion: {
      path: `accounts/${ACC}/containers/${CID}/versions/0`,
      accountId: ACC,
      containerId: CID,
      containerVersionId: "0",
      container: {
        path: `accounts/${ACC}/containers/${CID}`,
        accountId: ACC,
        containerId: CID,
        name: "{{STORE_NAME}} — Web",
        publicId: "{{WEB_GTM_ID}}",
        usageContext: ["WEB"],
        fingerprint: fp(),
        tagManagerUrl: `https://tagmanager.google.com/#/container/accounts/${ACC}/containers/${CID}/containers`,
      },
      name: `TSP Web — {{STORE_NAME}}`,
      description: `Generated by TrackSetup Pro v{{PACKAGE_VERSION}} for {{MYSHOPIFY_DOMAIN}} (${data.destinations.mode.toUpperCase()} mode). Events: ${data.events.selected.join(", ")}.${consentNote}`,
      tag: tags,
      trigger: triggers,
      variable: variables,
      builtInVariable: [
        { accountId: ACC, containerId: CID, type: "EVENT", name: "Event" },
        { accountId: ACC, containerId: CID, type: "PAGE_URL", name: "Page URL" },
        { accountId: ACC, containerId: CID, type: "PAGE_HOSTNAME", name: "Page Hostname" },
        { accountId: ACC, containerId: CID, type: "REFERRER", name: "Referrer" },
      ],
      fingerprint: fp(),
      tagManagerUrl: `https://tagmanager.google.com/#/versions/accounts/${ACC}/container/${CID}/versions/0`,
    },
  };

  return JSON.stringify(exportObj, null, 2);
}

function htmlTag(name: string, html: string, gid: number, triggerId: string): GtmEntity {
  return {
    accountId: ACC,
    containerId: CID,
    tagId: String(gid),
    name,
    type: "html",
    parameter: [tpl("html", html), bool("supportDocumentWrite", false)],
    firingTriggerId: [triggerId],
    tagFiringOption: "ONCE_PER_EVENT",
    monitoringMetadata: monitoring("custom"),
    consentSettings: NOT_SET,
    fingerprint: fp(),
  };
}

const META_SNIPPET = `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');`;

function metaBase(data: WizardData, gid: number, ceId: string): GtmEntity {
  const test = (data.destinations.credentials.meta?.testEventCode ?? "").trim();
  const html = `<script>
${META_SNIPPET}
fbq('init', '{{CONST - Meta Pixel ID}}'${test ? `, {}, { agent: 'tracksetup-pro' }` : ""});
fbq('track', 'PageView');
${test ? `fbq('set', 'test_event_code', '${test}');` : ""}
</script>`;
  return htmlTag("Meta • Base Pixel", html, gid, ceId);
}

function metaEvent(id: string, metaName: string, gid: number, ceId: string): GtmEntity {
  const html = `<script>
if (typeof fbq === 'function') {
  var params = {
    value: {{DLV - ecommerce.value}},
    currency: '{{DLV - ecommerce.currency}}',
    content_type: 'product'
  };
  ${id === "checkout_completed" ? "fbq('trackSingle', '{{CONST - Meta Pixel ID}}', '" + metaName + "', params, { eventID: {{DLV - ecommerce.transaction_id}} });" : `fbq('trackSingle', '{{CONST - Meta Pixel ID}}', '${metaName}', params);`}
}
</script>`;
  return htmlTag(`Meta • ${metaName}`, html, gid, ceId);
}

const TTQ_SNIPPET = `!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=['page','track','identify','instances','debug','on','off','once','ready','alias','group','enableCookie','disableCookie'];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};ttq.load=function(e,n){var i='https://analytics.tiktok.com/i18n/pixel/events.js';ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement('script');o.type='text/javascript';o.async=!0;o.src=i+'?sdkid='+e+'&lib='+t;var a=document.getElementsByTagName('script')[0];a.parentNode.insertBefore(o,a)}}(window,document,'ttq');`;

function ttqBase(data: WizardData, gid: number, ceId: string): GtmEntity {
  const pid = (data.destinations.credentials.tiktok?.pixelId ?? "").trim() || "{{TIKTOK_PIXEL_ID}}";
  const html = `<script>
${TTQ_SNIPPET}
ttq.load('${pid}');
ttq.page();
</script>`;
  return htmlTag("TikTok • Base Pixel", html, gid, ceId);
}

function ttqEvent(name: string, gid: number, ceId: string): GtmEntity {
  const html = `<script>
if (typeof ttq === 'object' && ttq.track) {
  ttq.track('${name}', { value: {{DLV - ecommerce.value}}, currency: '{{DLV - ecommerce.currency}}' });
}
</script>`;
  return htmlTag(`TikTok • ${name}`, html, gid, ceId);
}

const PIN_SNIPPET = `!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var n=window.pintrk;n.queue=[],n.version='3.0';var t=document.createElement('script');t.async=!0,t.src=e;var r=document.getElementsByTagName('script')[0];r.parentNode.insertBefore(t,r)}}('https://s.pinimg.com/ct/core.js');`;

function pinBase(data: WizardData, gid: number, ceId: string): GtmEntity {
  const tagId = (data.destinations.credentials.pinterest?.tagId ?? "").trim() || "{{PINTEREST_TAG_ID}}";
  const html = `<script>
${PIN_SNIPPET}
pintrk('load', '${tagId}');
pintrk('page');
</script>`;
  return htmlTag("Pinterest • Base Tag", html, gid, ceId);
}

function pinEvent(name: string, gid: number, ceId: string): GtmEntity {
  const html = `<script>
if (typeof pintrk === 'function') {
  pintrk('track', '${name}', { value: {{DLV - ecommerce.value}}, currency: '{{DLV - ecommerce.currency}}' });
}
</script>`;
  return htmlTag(`Pinterest • ${name}`, html, gid, ceId);
}

const SNAP_SNIPPET = `!function(e,n){if(!window.snaptr){var a=window.snaptr=function(){a.handleRequest?a.handleRequest.apply(a,arguments):a.queue.push(arguments)};a.queue=[];var t='sc-static.net/scevent.min.js';var s=document.createElement('script');s.async=!0;s.src='//'+t;var c=document.getElementsByTagName('script')[0];c.parentNode.insertBefore(s,c)}}('snap-pixel');`;

function snapBase(data: WizardData, gid: number, ceId: string): GtmEntity {
  const pid = (data.destinations.credentials.snapchat?.pixelId ?? "").trim() || "{{SNAPCHAT_PIXEL_ID}}";
  const html = `<script>
${SNAP_SNIPPET}
snaptr('init', '${pid}');
snaptr('track', 'PAGE_VIEW');
</script>`;
  return htmlTag("Snapchat • Base Pixel", html, gid, ceId);
}

function snapEvent(id: string, gid: number, ceId: string): GtmEntity {
  const map: Record<string, string> = {
    product_viewed: "VIEW_CONTENT",
    product_added_to_cart: "ADD_CART",
    checkout_started: "START_CHECKOUT",
    checkout_completed: "PURCHASE",
  };
  const name = map[id];
  if (!name) return htmlTag(`Snapchat • ${id}`, "<script>// noop</script>", gid, ceId);
  const html = `<script>
if (typeof snaptr === 'function') {
  snaptr('track', '${name}', { price: {{DLV - ecommerce.value}}, currency: '{{DLV - ecommerce.currency}}' });
}
</script>`;
  return htmlTag(`Snapchat • ${name}`, html, gid, ceId);
}

function awBase(data: WizardData, gid: number, ceId: string): GtmEntity {
  const cid = (data.destinations.credentials.googleads?.conversionId ?? "").trim() || "{{GOOGLEADS_CONVERSION_ID}}";
  const html = `<script async src="https://www.googletagmanager.com/gtag/js?id=${cid}"></script>
<script>
window['{{DATA_LAYER_NAME}}'] = window['{{DATA_LAYER_NAME}}'] || [];
function gtag(){ window['{{DATA_LAYER_NAME}}'].push(arguments); }
gtag('js', new Date());
gtag('config', '${cid}', { allow_enhanced_conversions: true });
</script>`;
  return htmlTag("Google Ads • gtag Config", html, gid, ceId);
}

function awPurchase(data: WizardData, gid: number, ceId: string): GtmEntity {
  const cid = (data.destinations.credentials.googleads?.conversionId ?? "").trim() || "{{GOOGLEADS_CONVERSION_ID}}";
  const label = (data.destinations.credentials.googleads?.conversionLabel ?? "").trim();
  const html = `<script>
if (typeof gtag === 'function' && '${label}') {
  gtag('event', 'conversion', {
    send_to: '${cid}/${label}',
    value: {{DLV - ecommerce.value}},
    currency: '{{DLV - ecommerce.currency}}',
    transaction_id: {{DLV - ecommerce.transaction_id}}
  });
}
</script>`;
  return htmlTag("Google Ads • Purchase Conversion", html, gid, ceId);
}
