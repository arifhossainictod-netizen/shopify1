import { PLATFORMS, platformById, EVENTS } from "./catalog";
import type { WizardData } from "./types";
import { normalizeShopifyHandle } from "./types";

const camelToSnake = (s: string) =>
  s.replace(/([a-z0-9])([A-Z])/g, "$1_$2").replace(/[\s-]+/g, "_").toUpperCase();

export const PACKAGE_VERSION = "1.4.0";

/** Flat map of {{TOKEN}} -> value, derived from wizard state. */
export function buildTokenMap(data: WizardData): Record<string, string> {
  const tokens: Record<string, string> = {
    STORE_NAME: data.basics.storeName.trim(),
    STORE_URL: data.basics.storeUrl.trim().replace(/\/$/, ""),
    MYSHOPIFY_DOMAIN:
      normalizeShopifyHandle(data.basics.myshopifyDomain) + ".myshopify.com",
    CONTACT_EMAIL: data.basics.contactEmail.trim(),
    CURRENCY: data.basics.currency,
    MODE: data.destinations.mode.toUpperCase(),
    WEB_GTM_ID: data.containers.webGtmId.trim().toUpperCase(),
    SERVER_GTM_ID: data.containers.serverGtmId.trim().toUpperCase(),
    TAGGING_SERVER_URL: data.containers.taggingServerUrl.trim().replace(/\/$/, ""),
    TRANSPORT_PATH: data.containers.transportPath.trim().replace(/^\/+/, ""),
    DATA_LAYER_NAME: data.events.dataLayerName.trim() || "dataLayer",
    HASH_USER_DATA: data.events.hashUserData ? "true" : "false",
    CONSENT_MODE: data.events.consentMode ? "true" : "false",
    CMP: data.events.cmp.toUpperCase(),
    ENABLED_EVENTS: data.events.selected.join(","),
    ENABLED_PLATFORMS: data.destinations.platforms.join(","),
    PACKAGE_VERSION,
    GENERATED_AT: new Date().toISOString(),
  };

  for (const platform of PLATFORMS) {
    const prefix = platform.id.toUpperCase();
    const creds = data.destinations.credentials[platform.id] ?? {};
    for (const field of platform.fields) {
      tokens[`${prefix}_${camelToSnake(field.key)}`] = (creds[field.key] ?? "").trim();
    }
  }

  const platformIds: Record<string, Record<string, string>> = {};
  for (const pid of data.destinations.platforms) {
    const p = platformById(pid);
    if (!p) continue;
    platformIds[pid] = {};
    for (const f of p.fields) {
      if (!f.secret) platformIds[pid][f.key] = (credsOf(data, pid, f.key) ?? "").trim();
    }
  }
  tokens.PLATFORM_IDS_JSON = JSON.stringify(platformIds);

  const eventMap = EVENTS.filter((e) => data.events.selected.includes(e.id)).map((e) => ({
    id: e.id,
    shopify: e.shopify,
    ga4: e.ga4,
    meta: e.meta,
    tiktok: e.tiktok,
    pinterest: e.pinterest,
  }));
  tokens.EVENT_MAP_JSON = JSON.stringify(eventMap);

  return tokens;
}

function credsOf(data: WizardData, pid: string, key: string): string | undefined {
  return data.destinations.credentials[pid]?.[key];
}

/**
 * Placeholder substitution: replaces every {{KNOWN_TOKEN}} with its value.
 * Unknown {{...}} sequences are left untouched — GTM-native variable
 * references like {{CONST - X}} survive compilation by design.
 */
export function renderTemplate(template: string, tokens: Record<string, string>): string {
  let out = template;
  for (const [token, value] of Object.entries(tokens)) {
    out = out.split(`{{${token}}}`).join(value);
  }
  return out;
}

/** Tokens that leak through as still-empty required placeholders. */
export function findUnresolved(template: string): string[] {
  const matches = template.match(/\{\{[A-Z0-9_]+\}\}/g) ?? [];
  return Array.from(new Set(matches));
}
