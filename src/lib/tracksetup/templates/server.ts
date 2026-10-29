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
const bool = (key: string, value: boolean): GtmParam => ({ type: "BOOLEAN", key, value: value ? "true" : "false" });
const intParam = (value: string) => ({ type: "INTEGER", value });
const listParam = (key: string, entries: GtmList[]): GtmParam => ({ type: "LIST", key, list: entries });
const mapEntry = (pairs: [string, string][]): GtmList => ({
  type: "MAP",
  map: pairs.map(([k, v]) => ({ type: "TEMPLATE", key: k, value: v })),
});

const ACC = "6000000002";
const CID = "7000000002";
const fp = () => Math.floor(Math.random() * 1e13).toString(16);

export function buildServerContainer(data: WizardData): string {
  const selected = EVENTS.filter((e) => data.events.selected.includes(e.id));
  const platforms = data.destinations.platforms
    .map((id) => platformById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const variables: GtmEntity[] = [];
  const triggers: GtmEntity[] = [];
  const tags: GtmEntity[] = [];
  const clients: GtmEntity[] = [];

  let vid = 4000;
  let tid = 2000;
  let gid = 5000;
  let cid = 6000;

  const evVar = (name: string, eventKey: string) => {
    variables.push({
      accountId: ACC,
      containerId: CID,
      variableId: String(vid++),
      name,
      type: "v",
      parameter: [
        { type: "TEMPLATE", key: "eventPath", value: eventKey },
        { type: "TEMPLATE", key: "name", value: `x-smp-event-data.${eventKey}` },
      ],
      fingerprint: fp(),
    });
    return `{{${name}}}`;
  };

  evVar("EV - event_name", "event_name");
  evVar("EV - ecommerce.items", "ecommerce.items");
  evVar("EV - ecommerce.value", "ecommerce.value");
  evVar("EV - ecommerce.currency", "ecommerce.currency");
  evVar("EV - user.email", "user.email");
  evVar("EV - client_id", "client_id");

  const serverTrigger = (eventName: string) => {
    const id = String(tid++);
    triggers.push({
      accountId: ACC,
      containerId: CID,
      triggerId: id,
      name: `EVT — ${eventName}`,
      type: "CUSTOM_EVENT",
      customEventFilter: [
        {
          type: "EQUALS",
          parameter: [
            { type: "TEMPLATE", key: "arg0", value: "{{EV - event_name}}" },
            { type: "TEMPLATE", key: "arg1", value: eventName },
          ],
        },
      ],
      fingerprint: fp(),
    });
    return id;
  };

  // ── Clients ────────────────────────────────────────────────────────────
  if (platforms.some((p) => p.id === "ga4")) {
    clients.push({
      accountId: ACC,
      containerId: CID,
      clientId: String(cid++),
      name: "Client — GA4 (gtag)",
      type: "sgtmgaawc",
      parameter: [
        tpl("measurementId", "{{GA4_MEASUREMENT_ID}}"),
        bool("enableUserData", data.events.hashUserData),
        tpl("apiSecret", "{{GA4_API_SECRET}}"),
      ],
      priority: intParam("10"),
      fingerprint: fp(),
    });
  }

  // TSP transport webhook client — claims the /{{TRANSPORT_PATH}} beacon path
  clients.push({
    accountId: ACC,
    containerId: CID,
    clientId: String(cid++),
    name: "Client — TSP Transport (/_tsp)",
    type: "cvt_tsp_transport",
    parameter: [
      tpl("path", "/{{TRANSPORT_PATH}}"),
      tpl("responseCode", "200"),
      bool("enableCors", true),
      tpl("corsOrigin", "{{STORE_URL}}"),
    ],
    priority: intParam("20"),
    fingerprint: fp(),
  });

  // ── Tags ───────────────────────────────────────────────────────────────
  for (const evt of selected) {
    const evtName = evt.ga4 ?? evt.id;
    const trigId = serverTrigger(evtName);

    if (platforms.some((p) => p.id === "ga4") && evt.ga4) {
      tags.push({
        accountId: ACC,
        containerId: CID,
        tagId: String(gid++),
        name: `sGTM • GA4 — ${evt.label}`,
        type: "sgtmgaawe",
        parameter: [
          tpl("eventName", `{{EV - event_name}}`),
          tpl("measurementId", "{{GA4_MEASUREMENT_ID}}"),
          tpl("apiSecret", "{{GA4_API_SECRET}}"),
          listParam("eventParameters", [
            mapEntry([["name", "items"], ["value", "{{EV - ecommerce.items}}"]]),
            mapEntry([["name", "value"], ["value", "{{EV - ecommerce.value}}"]]),
            mapEntry([["name", "currency"], ["value", "{{EV - ecommerce.currency}}"]]),
          ]),
        ],
        firingTriggerId: [trigId],
        tagFiringOption: "UNLIMITED",
        fingerprint: fp(),
      });
    }

    if (platforms.some((p) => p.id === "meta") && evt.meta) {
      tags.push({
        accountId: ACC,
        containerId: CID,
        tagId: String(gid++),
        name: `sGTM • Meta CAPI — ${evt.label}`,
        type: "cvt_tsp_meta_capi",
        parameter: [
          tpl("pixel_id", "{{META_PIXEL_ID}}"),
          tpl("access_token", "{{META_ACCESS_TOKEN}}"),
          tpl("event_name", evt.meta),
          tpl("event_id", `{{EV - client_id}}-${evt.id}`),
          listParam("userData", [
            mapEntry([["name", "em"], ["value", "{{EV - user.email}}"]]),
            mapEntry([["name", "client_ip_address"], ["value", "{{EV - client_id}}"]]),
          ]),
        ],
        firingTriggerId: [trigId],
        tagFiringOption: "UNLIMITED",
        fingerprint: fp(),
      });
    }

    if (platforms.some((p) => p.id === "tiktok") && evt.tiktok) {
      tags.push({
        accountId: ACC,
        containerId: CID,
        tagId: String(gid++),
        name: `sGTM • TikTok Events API — ${evt.label}`,
        type: "cvt_tsp_tiktok_eapi",
        parameter: [
          tpl("pixel_code", "{{TIKTOK_PIXEL_ID}}"),
          tpl("access_token", "{{TIKTOK_ACCESS_TOKEN}}"),
          tpl("event", evt.tiktok),
          tpl("event_id", "{{EV - client_id}}"),
        ],
        firingTriggerId: [trigId],
        tagFiringOption: "UNLIMITED",
        fingerprint: fp(),
      });
    }

    if (platforms.some((p) => p.id === "pinterest") && evt.pinterest) {
      tags.push({
        accountId: ACC,
        containerId: CID,
        tagId: String(gid++),
        name: `sGTM • Pinterest CAPI — ${evt.label}`,
        type: "cvt_tsp_pinterest_capi",
        parameter: [
          tpl("tag_id", "{{PINTEREST_TAG_ID}}"),
          tpl("api_token", "{{PINTEREST_ACCESS_TOKEN}}"),
          tpl("event_name", evt.pinterest),
        ],
        firingTriggerId: [trigId],
        tagFiringOption: "UNLIMITED",
        fingerprint: fp(),
      });
    }
  }

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
        name: "{{STORE_NAME}} — Server",
        publicId: "{{SERVER_GTM_ID}}",
        usageContext: ["SERVER"],
        fingerprint: fp(),
        tagManagerUrl: `https://tagmanager.google.com/#/container/accounts/${ACC}/containers/${CID}/containers`,
      },
      name: `TSP Server — {{STORE_NAME}}`,
      description: `Generated by TrackSetup Pro v{{PACKAGE_VERSION}} for {{MYSHOPIFY_DOMAIN}}. Tagging endpoint: {{TAGGING_SERVER_URL}}/{{TRANSPORT_PATH}}. ${
        data.events.hashUserData ? "User data hashed with SHA-256 before forwarding." : "Raw user data forwarding (hashing disabled)."
      } Install community templates referenced by cvt_* types before import.`,
      tag: tags,
      trigger: triggers,
      variable: variables,
      client: clients,
      builtInVariable: [
        { accountId: ACC, containerId: CID, type: "EVENT_NAME" },
        { accountId: ACC, containerId: CID, type: "REQUEST_PATH" },
        { accountId: ACC, containerId: CID, type: "CLIENT_NAME" },
      ],
      fingerprint: fp(),
      tagManagerUrl: `https://tagmanager.google.com/#/versions/accounts/${ACC}/container/${CID}/versions/0`,
    },
  };

  return JSON.stringify(exportObj, null, 2);
}
