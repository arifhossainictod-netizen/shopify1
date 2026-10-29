"use client";

import { CircleDollarSign, Link2, Mail, Package, Store } from "lucide-react";
import { useWizardStore } from "@/lib/tracksetup/store";
import { CURRENCIES } from "@/lib/tracksetup/catalog";
import { Field, SectionTitle, TextInput } from "./ui";
import { normalizeShopifyHandle } from "@/lib/tracksetup/types";

export default function StepBasics() {
  const { data, errors, setBasics, clearError } = useWizardStore();
  const handle = normalizeShopifyHandle(data.basics.myshopifyDomain);

  return (
    <div>
      <SectionTitle
        kicker="Step 01 — Basics"
        title="Who's this store?"
        desc="Branding metadata and the two URLs Shopify can't rotate — the live storefront and the permanent .myshopify.com domain used for server-side identity."
      />

      <div className="grid gap-5">
        <Field label="Store name" error={errors.storeName} hint="branding">
          <TextInput
            value={data.basics.storeName}
            onChange={(v) => {
              setBasics("storeName", v);
              clearError("storeName");
            }}
            placeholder="Northwind Supply Co."
            error={Boolean(errors.storeName)}
            icon={<Store className="h-4 w-4" />}
          />
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Live store URL"
            error={errors.storeUrl}
            hint="https://"
          >
            <TextInput
              value={data.basics.storeUrl}
              onChange={(v) => {
                setBasics("storeUrl", v);
                clearError("storeUrl");
              }}
              placeholder="https://northwind-supply.com"
              error={Boolean(errors.storeUrl)}
              icon={<Link2 className="h-4 w-4" />}
              monospace
            />
          </Field>

          <Field
            label="Permanent myshopify.com domain"
            error={errors.myshopifyDomain}
            hint="shopify id"
          >
            <div className="flex items-stretch">
              <div className="relative flex-1">
                <input
                  className="input rounded-r-none font-mono text-[13px]"
                  data-error={errors.myshopifyDomain ? "true" : undefined}
                  value={data.basics.myshopifyDomain}
                  placeholder="northwind-supply"
                  spellCheck={false}
                  autoComplete="off"
                  onChange={(e) => {
                    setBasics("myshopifyDomain", e.target.value);
                    clearError("myshopifyDomain");
                  }}
                />
              </div>
              <span className="flex items-center rounded-r-lg border border-l-0 border-line bg-panel2 px-3 font-mono text-[11px] text-dim">
                .myshopify.com
              </span>
            </div>
          </Field>
        </div>

        {handle ? (
          <div className="flex items-center gap-2 rounded-lg border border-teal/25 bg-teal/[0.06] px-3.5 py-2.5">
            <Package className="h-3.5 w-3.5 text-teal" />
            <p className="font-mono text-[11.5px] text-teal">
              server identity → {handle}.myshopify.com
            </p>
          </div>
        ) : null}

        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Ops contact email" error={errors.contactEmail} hint="alerts">
            <TextInput
              value={data.basics.contactEmail}
              onChange={(v) => {
                setBasics("contactEmail", v);
                clearError("contactEmail");
              }}
              placeholder="ops@northwind-supply.com"
              error={Boolean(errors.contactEmail)}
              icon={<Mail className="h-4 w-4" />}
            />
          </Field>

          <Field label="Default currency" hint="iso 4217">
            <div className="relative">
              <CircleDollarSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-dim" />
              <select
                className="input appearance-none pl-10"
                value={data.basics.currency}
                onChange={(e) => setBasics("currency", e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c} value={c} className="bg-panel">
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </Field>
        </div>
      </div>
    </div>
  );
}
