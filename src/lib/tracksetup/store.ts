"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { WizardData, TrackingMode, Cmp } from "./types";
import { defaultWizardData } from "./types";
import { validateStep, type StepErrors } from "./validate";

export interface WizardStore {
  data: WizardData;
  step: number;
  errors: StepErrors;
  savedId: string | null;
  zipReady: boolean;
  setStep: (n: number) => void;
  setBasics: <K extends keyof WizardData["basics"]>(k: K, v: WizardData["basics"][K]) => void;
  setMode: (m: TrackingMode) => void;
  togglePlatform: (id: string) => void;
  setCredential: (pid: string, key: string, v: string) => void;
  setContainers: <K extends keyof WizardData["containers"]>(k: K, v: WizardData["containers"][K]) => void;
  setEvents: <K extends keyof WizardData["events"]>(k: K, v: WizardData["events"][K]) => void;
  toggleEvent: (id: string) => void;
  toggleAllEvents: (on: boolean) => void;
  clearError: (k: string) => void;
  setErrors: (e: StepErrors) => void;
  next: () => boolean;
  prev: () => void;
  fillDemo: () => void;
  reset: () => void;
  markSaved: (id: string | null) => void;
  setZipReady: (v: boolean) => void;
}

export const useWizardStore = create<WizardStore>()(
  persist(
    (set, get) => ({
      data: defaultWizardData,
      step: 1,
      errors: {},
      savedId: null,
      zipReady: false,
      setStep: (n) => set({ step: n, errors: {} }),
      setBasics: (k, v) =>
        set((s) => ({ data: { ...s.data, basics: { ...s.data.basics, [k]: v } } })),
      setMode: (m) =>
        set((s) => ({ data: { ...s.data, destinations: { ...s.data.destinations, mode: m } } })),
      togglePlatform: (id) =>
        set((s) => {
          const has = s.data.destinations.platforms.includes(id);
          const platforms = has
            ? s.data.destinations.platforms.filter((p) => p !== id)
            : [...s.data.destinations.platforms, id];
          return {
            data: {
              ...s.data,
              destinations: { ...s.data.destinations, platforms },
            },
          };
        }),
      setCredential: (pid, key, v) =>
        set((s) => ({
          data: {
            ...s.data,
            destinations: {
              ...s.data.destinations,
              credentials: {
                ...s.data.destinations.credentials,
                [pid]: { ...(s.data.destinations.credentials[pid] ?? {}), [key]: v },
              },
            },
          },
        })),
      setContainers: (k, v) =>
        set((s) => ({ data: { ...s.data, containers: { ...s.data.containers, [k]: v } } })),
      setEvents: (k, v) =>
        set((s) => ({ data: { ...s.data, events: { ...s.data.events, [k]: v } as WizardData["events"] } })),
      toggleEvent: (id) =>
        set((s) => {
          const has = s.data.events.selected.includes(id);
          return {
            data: {
              ...s.data,
              events: {
                ...s.data.events,
                selected: has
                  ? s.data.events.selected.filter((e) => e !== id)
                  : [...s.data.events.selected, id],
              },
            },
          };
        }),
      toggleAllEvents: (on) =>
        set((s) => ({
          data: {
            ...s.data,
            events: {
              ...s.data.events,
              selected: on
                ? ["page_viewed", "product_viewed", "search_submitted", "product_added_to_cart", "product_removed_from_cart", "cart_viewed", "checkout_started", "checkout_contact_info_submitted", "payment_info_submitted", "checkout_completed"]
                : [],
            },
          },
        })),
      clearError: (k) =>
        set((s) => {
          const e = { ...s.errors };
          delete e[k];
          return { errors: e };
        }),
      setErrors: (e) => set({ errors: e }),
      next: () => {
        const { step, data } = get();
        const errs = validateStep(step, data);
        if (Object.keys(errs).length > 0) {
          set({ errors: errs });
          return false;
        }
        set({ errors: {}, step: Math.min(5, step + 1) });
        return true;
      },
      prev: () => set((s) => ({ errors: {}, step: Math.max(1, s.step - 1) })),
      fillDemo: () =>
        set({
          errors: {},
          savedId: null,
          zipReady: false,
          data: {
            basics: {
              storeName: "Northwind Supply Co.",
              storeUrl: "https://northwind-supply.com",
              myshopifyDomain: "northwind-supply",
              contactEmail: "ops@northwind-supply.com",
              currency: "USD",
            },
            destinations: {
              mode: "hybrid",
              platforms: ["ga4", "meta", "tiktok"],
              credentials: {
                ga4: { measurementId: "G-9XK2M4PLRD", apiSecret: "mp_secret_nw_7f3a" },
                meta: { pixelId: "7382019450261", accessToken: "EAAGw8p...", testEventCode: "TEST12345" },
                tiktok: { pixelId: "C4A1B2C3D4E5F6G7H8", accessToken: "tk_nw_prod" },
              },
            },
            containers: {
              webGtmId: "GTM-5TQ7Z2K",
              serverGtmId: "GTM-S9D4M2P1",
              taggingServerUrl: "https://gtm.northwind-supply.com",
              transportPath: "_tsp",
            },
            events: {
              selected: [
                "page_viewed",
                "product_viewed",
                "product_added_to_cart",
                "checkout_started",
                "payment_info_submitted",
                "checkout_completed",
              ],
              hashUserData: true,
              consentMode: true,
              cmp: "shopify",
              dataLayerName: "dataLayer",
            },
          },
        }),
      reset: () =>
        set({
          data: defaultWizardData,
          step: 1,
          errors: {},
          savedId: null,
          zipReady: false,
        }),
      markSaved: (id) => set({ savedId: id }),
      setZipReady: (v) => set({ zipReady: v }),
    }),
    {
      name: "tsp-wizard-v1",
      partialize: (s) => ({ data: s.data, step: s.step, savedId: s.savedId, zipReady: s.zipReady }),
    },
  ),
);

export const cmpOptions: Cmp[] = ["none", "shopify", "cookiebot", "onetrust"];
