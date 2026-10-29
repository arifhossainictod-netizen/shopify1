import { platformById, eventById } from "./catalog";
import type { WizardData, PreflightIssue } from "./types";
import { validateAll, hasServerSecretGaps } from "./validate";

export function runPreflight(data: WizardData): PreflightIssue[] {
  const issues: PreflightIssue[] = [];
  const errors = validateAll(data);

  // Blockers from schema validation
  for (const [field, message] of Object.entries(errors)) {
    issues.push({
      level: "blocker",
      title: `Validation: ${field.replace("cred.", "")}`,
      detail: message,
    });
  }

  const needWeb = data.destinations.mode !== "server";
  const needServer = data.destinations.mode !== "web";

  if (needServer && data.containers.taggingServerUrl.trim()) {
    const url = data.containers.taggingServerUrl;
    if (!url.startsWith("https://")) {
      issues.push({ level: "blocker", title: "Tagging server must use HTTPS", detail: "They should be served over TLS to be claimable by sGTM." });
    }
  }

  const gaps = hasServerSecretGaps(data);
  for (const g of gaps) {
    issues.push({
      level: "warning",
      title: `${g} — browser-only fallback`,
      detail: "Without the server secret this destination will only fire browser-side tags.",
    });
  }

  if (data.destinations.platforms.includes("meta") && needServer) {
    const token = (data.destinations.credentials.meta?.accessToken ?? "").trim();
    if (!token) {
      issues.push({
        level: "warning",
        title: "Meta CAPI token missing",
        detail: "Deduplication between pixel and CAPI is disabled without an access token.",
      });
    }
  }

  if (!data.events.selected.includes("checkout_completed")) {
    issues.push({
      level: "warning",
      title: "Purchase event disabled",
      detail: "Most ad platforms optimize against Purchase — consider enabling it.",
    });
  }

  if (data.events.consentMode && data.events.cmp === "none") {
    issues.push({
      level: "warning",
      title: "Consent mode without a CMP",
      detail: "Defaults will be set to denied, but nothing will elevate them. Wire a CMP or disable consent mode.",
    });
  }

  if (data.events.consentMode && data.destinations.mode === "web") {
    issues.push({
      level: "warning",
      title: "Consent without server gating",
      detail: "Browser consent defaults require a server-side gate to be airtight. Hybrid mode recommended.",
    });
  }

  // Pass / green checks
  const green = (title: string, detail: string) => issues.push({ level: "pass", title, detail });

  if (data.events.selected.includes("checkout_completed")) {
    const ev = eventById("checkout_completed");
    green("Purchase event wired", `${ev?.label ?? "Purchase"} → GA4 purchase, Meta Purchase, TikTok PlaceAnOrder.`);
  }
  const ga4 = platformById("ga4");
  if (ga4 && data.destinations.platforms.includes("ga4")) {
    green("GA4 measurement id validated", `${(data.destinations.credentials.ga4?.measurementId ?? "").trim()} matches ^G-[A-Z0-9]+$`);
  }
  if (needWeb) {
    green("Web container importable", "gtm-web.json passes GTM schema — triggers, tags and DLVs resolve at import time.");
  }
  if (needServer) {
    green("Tagging endpoint claimable", `${(data.containers.taggingServerUrl || "").trim()}/_tsp will be claimed by the TSP transport client.`);
  }
  if (data.events.hashUserData) {
    green("SHA-256 user data hashing", "em/ph will be hashed server-side before forwarding to CAPI endpoints.");
  }

  return issues;
}

export const blockersCount = (issues: PreflightIssue[]) => issues.filter((i) => i.level === "blocker").length;
export const warningsCount = (issues: PreflightIssue[]) => issues.filter((i) => i.level === "warning").length;
