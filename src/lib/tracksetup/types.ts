export type TrackingMode = "web" | "server" | "hybrid";
export type Cmp = "none" | "shopify" | "cookiebot" | "onetrust";

export interface BasicsData {
  storeName: string;
  storeUrl: string;
  /** bare handle ("acme") or full domain ("acme.myshopify.com") */
  myshopifyDomain: string;
  contactEmail: string;
  currency: string;
}

export interface DestinationsData {
  mode: TrackingMode;
  platforms: string[];
  /** platformId -> fieldKey -> value */
  credentials: Record<string, Record<string, string>>;
}

export interface ContainersData {
  webGtmId: string;
  serverGtmId: string;
  taggingServerUrl: string;
  transportPath: string;
}

export interface EventsData {
  selected: string[];
  hashUserData: boolean;
  consentMode: boolean;
  cmp: Cmp;
  dataLayerName: string;
}

export interface WizardData {
  basics: BasicsData;
  destinations: DestinationsData;
  containers: ContainersData;
  events: EventsData;
}

export interface PackageFile {
  name: string;
  content: string;
}

export type IssueLevel = "blocker" | "warning" | "pass";

export interface PreflightIssue {
  level: IssueLevel;
  title: string;
  detail: string;
}

export const defaultWizardData: WizardData = {
  basics: {
    storeName: "",
    storeUrl: "",
    myshopifyDomain: "",
    contactEmail: "",
    currency: "USD",
  },
  destinations: { mode: "hybrid", platforms: [], credentials: {} },
  containers: { webGtmId: "", serverGtmId: "", taggingServerUrl: "", transportPath: "_tsp" },
  events: {
    selected: [
      "page_viewed",
      "product_viewed",
      "product_added_to_cart",
      "checkout_started",
      "checkout_completed",
    ],
    hashUserData: true,
    consentMode: true,
    cmp: "shopify",
    dataLayerName: "dataLayer",
  },
};

export function normalizeShopifyHandle(raw: string): string {
  const v = raw.trim().toLowerCase();
  if (!v) return "";
  return v.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/\.myshopify\.com$/, "");
}
