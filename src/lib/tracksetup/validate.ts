import { z } from "zod";
import { PLATFORMS, platformById } from "./catalog";
import type { WizardData } from "./types";
import { normalizeShopifyHandle } from "./types";

export type StepErrors = Record<string, string>;

const urlOk = (v: string, requireHttps = false) => {
  try {
    const u = new URL(v);
    if (requireHttps && u.protocol !== "https:") return false;
    return u.protocol === "https:" || u.protocol === "http:";
  } catch {
    return false;
  }
};

const basicsSchema = z.object({
  storeName: z.string().trim().min(2, "At least 2 characters"),
  storeUrl: z.string().trim(),
  myshopifyDomain: z.string().trim(),
  contactEmail: z.string().trim(),
  currency: z.string().regex(/^[A-Z]{3}$/, "3-letter ISO code"),
});

export function validateStep(step: number, d: WizardData): StepErrors {
  const errors: StepErrors = {};

  if (step === 1) {
    const parsed = basicsSchema.safeParse(d.basics);
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        const key = String(issue.path[0]);
        if (!errors[key]) errors[key] = issue.message;
      }
    }
    if (!d.basics.storeUrl.trim()) {
      errors.storeUrl = "Live store URL is required";
    } else if (!urlOk(d.basics.storeUrl.trim())) {
      errors.storeUrl = "Must be a valid URL, e.g. https://acme-supply.com";
    }
    const handle = normalizeShopifyHandle(d.basics.myshopifyDomain);
    if (!handle) {
      errors.myshopifyDomain = "Permanent .myshopify.com domain is required";
    } else if (!/^[a-z0-9][a-z0-9-]{2,62}$/.test(handle) || /--/.test(handle)) {
      errors.myshopifyDomain = "Handle must be 3+ chars of letters, numbers or single dashes";
    }
    if (!d.basics.contactEmail.trim()) {
      errors.contactEmail = "Ops email is required";
    } else if (!/^\S+@\S+\.\S+$/.test(d.basics.contactEmail.trim())) {
      errors.contactEmail = "Not a valid email address";
    }
  }

  if (step === 2) {
    if (d.destinations.platforms.length === 0) {
      errors.platforms = "Select at least one destination platform";
    }
    for (const pid of d.destinations.platforms) {
      const p = platformById(pid);
      if (!p) continue;
      for (const f of p.fields) {
        const value = (d.destinations.credentials[pid]?.[f.key] ?? "").trim();
        if (f.required && !value) {
          errors[`cred.${pid}.${f.key}`] = `${f.label} is required for ${p.name}`;
          continue;
        }
        if (value && f.pattern && !new RegExp(f.pattern).test(value)) {
          errors[`cred.${pid}.${f.key}`] = f.patternHint ?? `Invalid ${f.label} format`;
        }
      }
    }
  }

  if (step === 3) {
    const needWeb = d.destinations.mode !== "server";
    const needServer = d.destinations.mode !== "web";
    const gtmPattern = /^GTM-[A-Z0-9]{5,}$/;
    if (needWeb && !gtmPattern.test(d.containers.webGtmId.trim().toUpperCase())) {
      errors.webGtmId = "Format GTM-XXXXXXX (find it in GTM → Admin)";
    }
    if (needServer && !gtmPattern.test(d.containers.serverGtmId.trim().toUpperCase())) {
      errors.serverGtmId = "Required for server/hybrid — format GTM-XXXXXXX";
    }
    if (needServer) {
      const url = d.containers.taggingServerUrl.trim();
      if (!url) {
        errors.taggingServerUrl = "Tagging server URL is required for server-side delivery";
      } else if (!/^https:\/\//.test(url) || !urlOk(url, true)) {
        errors.taggingServerUrl = "Must be a valid https:// endpoint (no trailing path)";
      }
      if (!/^[a-zA-Z0-9_-]{1,64}$/.test(d.containers.transportPath.trim())) {
        errors.transportPath = "Letters, digits, dash or underscore — no leading slash";
      }
    }
  }

  if (step === 4) {
    if (d.events.selected.length === 0) {
      errors.selected = "Enable at least one event";
    }
    if (!/^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(d.events.dataLayerName.trim())) {
      errors.dataLayerName = "JS identifier only, e.g. dataLayer";
    }
  }

  return errors;
}

export function validateAll(d: WizardData): StepErrors {
  return {
    ...validateStep(1, d),
    ...validateStep(2, d),
    ...validateStep(3, d),
    ...validateStep(4, d),
  };
}

export const hasServerSecretGaps = (d: WizardData): string[] => {
  const gaps: string[] = [];
  if (d.destinations.mode === "web") return gaps;
  for (const pid of d.destinations.platforms) {
    const p = platformById(pid);
    if (!p) continue;
    for (const f of p.fields) {
      if (f.secret && f.serverNote && !(d.destinations.credentials[pid]?.[f.key] ?? "").trim()) {
        gaps.push(`${p.short}: ${f.label}`);
      }
    }
  }
  return gaps;
};
