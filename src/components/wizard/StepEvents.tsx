"use client";

import { Fingerprint, ShieldCheck } from "lucide-react";
import { CMP_OPTIONS, EVENTS } from "@/lib/tracksetup/catalog";
import { useWizardStore } from "@/lib/tracksetup/store";
import { Field, SectionTitle, TextInput, Toggle } from "./ui";
import type { Cmp } from "@/lib/tracksetup/types";

export default function StepEvents() {
  const { data, errors, toggleEvent, toggleAllEvents, setEvents, clearError } = useWizardStore();
  const selected = data.events.selected;
  const funnel = EVENTS.filter((e) => e.group === "funnel");
  const engagement = EVENTS.filter((e) => e.group === "engagement");
  const allOn = selected.length === EVENTS.length;

  return (
    <div>
      <SectionTitle
        kicker="Step 04 — Events & Privacy"
        title="Which signals matter?"
        desc="Toggle the e-commerce and engagement events compiled into your containers and pixel script. Mapping table lives in the README."
      />

      <div className="mb-5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
          {selected.length} / {EVENTS.length} events enabled
        </p>
        <button
          type="button"
          onClick={() => toggleAllEvents(!allOn)}
          className="font-mono text-[10px] uppercase tracking-[0.22em] text-teal underline-offset-4 hover:underline"
        >
          {allOn ? "disable all" : "enable all"}
        </button>
      </div>

      {errors.selected ? (
        <p className="mb-4 rounded-lg border border-red/40 bg-red/[0.07] px-3.5 py-2.5 text-[12.5px] text-red">
          {errors.selected}
        </p>
      ) : null}

      {[
        { label: "Purchase funnel", list: funnel },
        { label: "Engagement", list: engagement },
      ].map(({ label, list }) => (
        <div key={label} className="mb-6">
          <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-dim">{label}</p>
          <div className="grid gap-2.5 sm:grid-cols-2">
            {list.map((e) => {
              const on = selected.includes(e.id);
              return (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => {
                    toggleEvent(e.id);
                    clearError("selected");
                  }}
                  className={`relative overflow-hidden rounded-xl border p-3.5 text-left transition-all duration-200 ${
                    on ? "border-acc/50 bg-panel" : "border-line bg-panel2/40 opacity-70 hover:opacity-100"
                  }`}
                >
                  <span
                    className={`absolute inset-y-0 left-0 w-[3px] transition-colors ${on ? "bg-acc" : "bg-transparent"}`}
                  />
                  <span className="flex items-start justify-between gap-3 pl-2.5">
                    <span>
                      <span className="flex items-center gap-1.5 text-[13px] font-semibold text-hi">
                        {e.label}
                        {e.recommended ? (
                          <span className="rounded-full bg-acc/15 px-1.5 py-0.5 font-mono text-[8.5px] uppercase tracking-[0.14em] text-acc">
                            rec
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-1 block text-[11.5px] leading-snug text-mid">{e.desc}</span>
                      <span className="mt-2 block font-mono text-[10px] text-dim">
                        {e.shopify} → <span className="text-teal">{e.ga4 ?? "custom"}</span>
                      </span>
                    </span>
                    <span
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded-full border transition-all ${
                        on ? "border-acc bg-acc shadow-[0_0_10px_rgba(180,255,58,0.5)]" : "border-line2"
                      }`}
                    />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-8 border-t border-line pt-8">
        <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.22em] text-dim">Privacy & consent</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Toggle
            checked={data.events.hashUserData}
            onChange={(v) => setEvents("hashUserData", v)}
            label="SHA-256 hashing for user data"
            desc="Emails & phones are hashed server-side before forwarding to CAPI endpoints."
          />
          <Toggle
            checked={data.events.consentMode}
            onChange={(v) => setEvents("consentMode", v)}
            label="Google Consent Mode v2"
            desc="Denied-by-default state signals compiled into container and consent/defaults.json."
          />
        </div>

        {data.events.consentMode ? (
          <div className="mt-4">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-dim">Consent platform</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {CMP_OPTIONS.map((c) => {
                const active = data.events.cmp === (c.id as Cmp);
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setEvents("cmp", c.id as Cmp)}
                    className={`rounded-xl border p-3.5 text-left transition-all ${
                      active ? "border-teal/60 bg-teal/[0.06]" : "border-line bg-panel2/40 hover:border-line2"
                    }`}
                  >
                    <span className="flex items-center gap-2 text-[13px] font-semibold text-hi">
                      <ShieldCheck className={`h-3.5 w-3.5 ${active ? "text-teal" : "text-dim"}`} />
                      {c.label}
                    </span>
                    <span className="mt-1 block text-[11.5px] leading-snug text-mid">{c.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field
            label="dataLayer variable name"
            error={errors.dataLayerName}
            hint="must match GTM"
          >
            <TextInput
              value={data.events.dataLayerName}
              onChange={(v) => {
                setEvents("dataLayerName", v);
                clearError("dataLayerName");
              }}
              placeholder="dataLayer"
              error={Boolean(errors.dataLayerName)}
              icon={<Fingerprint className="h-4 w-4" />}
              monospace
            />
          </Field>
          <div className="rounded-xl border border-line bg-panel2/50 p-4">
            <p className="text-[12px] leading-relaxed text-mid">
              Renaming dataLayer is a pro move that avoids collisions with other apps — GTM will still
              resolve it because both bridges and the container reference <span className="font-mono text-teal">{data.events.dataLayerName || "dataLayer"}</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
