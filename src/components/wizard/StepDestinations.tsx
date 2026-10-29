"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Check, Globe2, KeyRound, Layers, Server, ShieldCheck } from "lucide-react";
import { PLATFORMS } from "@/lib/tracksetup/catalog";
import { useWizardStore } from "@/lib/tracksetup/store";
import { Field, SectionTitle, Segmented, TextInput } from "./ui";
import type { TrackingMode } from "@/lib/tracksetup/types";

const MODE_OPTIONS: { id: TrackingMode; label: string; desc: string; tag?: string }[] = [
  {
    id: "web",
    label: "Web only",
    desc: "Browser GTM container + pixel script. Fastest, weakest against ITP/ad-blockers.",
  },
  {
    id: "server",
    label: "Server-side",
    desc: "sGTM + Conversions APIs only. Strongest data quality, no browser tags.",
  },
  {
    id: "hybrid",
    label: "Hybrid",
    desc: "Browser + server with event deduplication. The default for growth teams.",
    tag: "recommended",
  },
];

export default function StepDestinations() {
  const { data, errors, setMode, togglePlatform, setCredential, clearError } = useWizardStore();
  const selected = data.destinations.platforms;

  return (
    <div>
      <SectionTitle
        kicker="Step 02 — Destinations"
        title="Where do events land?"
        desc="Pick the delivery mode and the platforms receiving your events. Credential fields appear dynamically per destination."
      />

      <div className="mb-8">
        <p className="mb-3 font-mono text-[10px] uppercase tracking-[0.22em] text-dim">Delivery mode</p>
        <Segmented options={MODE_OPTIONS} value={data.destinations.mode} onChange={(m: TrackingMode) => setMode(m)} />
      </div>

      <p className="mb-3 flex items-baseline justify-between font-mono text-[10px] uppercase tracking-[0.22em] text-dim">
        <span>Platforms</span>
        <span>{selected.length} selected</span>
      </p>

      {errors.platforms ? (
        <p className="mb-3 rounded-lg border border-red/40 bg-red/[0.07] px-3.5 py-2.5 text-[12.5px] text-red">
          {errors.platforms}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map((p) => {
          const active = selected.includes(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                togglePlatform(p.id);
                clearError("platforms");
              }}
              className={`group relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
                active ? "border-acc/60 bg-panel" : "border-line bg-panel2/40 hover:border-line2"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-mono text-[12px] font-bold text-void"
                  style={{ backgroundColor: p.color }}
                >
                  {p.short.slice(0, 2)}
                </span>
                <span
                  className={`flex h-5 w-5 items-center justify-center rounded-full border transition-all ${
                    active ? "border-acc bg-acc" : "border-line2"
                  }`}
                >
                  {active ? <Check className="h-3 w-3 text-acc-ink" /> : null}
                </span>
              </div>
              <p className="mt-3 text-[13.5px] font-semibold text-hi">{p.name}</p>
              <p className="mt-1 text-[11.5px] leading-relaxed text-mid">{p.blurb}</p>
              {active ? (
                <motion.span
                  layoutId={`plat-glow-${p.id}`}
                  className="pointer-events-none absolute -bottom-8 -right-8 h-20 w-20 rounded-full blur-2xl"
                  style={{ backgroundColor: `${p.color}30` }}
                />
              ) : null}
            </button>
          );
        })}
      </div>

      <AnimatePresence initial={false}>
        {selected.map((pid) => {
          const p = PLATFORMS.find((x) => x.id === pid);
          if (!p) return null;
          return (
            <motion.div
              key={pid}
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 16 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              transition={{ duration: 0.28, ease: "easeOut" }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-line bg-panel p-5" style={{ borderLeft: `3px solid ${p.color}` }}>
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-hi">
                    <KeyRound className="h-4 w-4 text-teal" />
                    {p.name} credentials
                  </p>
                  <span className="chip">{p.serverLabel}</span>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  {p.fields.map((f) => (
                    <Field
                      key={f.key}
                      label={`${f.label}${f.required ? " *" : ""}`}
                      hint={f.helper}
                      error={errors[`cred.${pid}.${f.key}`]}
                    >
                      <TextInput
                        value={data.destinations.credentials[pid]?.[f.key] ?? ""}
                        onChange={(v) => {
                          setCredential(pid, f.key, v);
                          clearError(`cred.${pid}.${f.key}`);
                        }}
                        placeholder={f.placeholder}
                        error={Boolean(errors[`cred.${pid}.${f.key}`])}
                        secret={Boolean(f.secret)}
                        monospace
                      />
                    </Field>
                  ))}
                </div>
                {p.fields.some((f) => f.secret && data.destinations.mode !== "web") ? (
                  <p className="mt-4 flex items-start gap-2 text-[11.5px] leading-relaxed text-dim">
                    <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-teal" />
                    Secrets never render into the web container — they are injected only into the server
                    container JSON, and stored salted in your workspace.
                  </p>
                ) : null}
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>

      {data.destinations.mode !== "web" ? (
        <div className="mt-6 grid gap-3 rounded-xl border border-line bg-panel2/50 p-5 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <Server className="mt-0.5 h-4 w-4 text-teal" />
            <p className="text-[12.5px] leading-relaxed text-mid">
              <span className="font-semibold text-hi">Server delivery</span> — events beacon to your tagging
              server and forward via Conversions / Events APIs. Resistant to ITP & blockers.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Globe2 className="mt-0.5 h-4 w-4 text-teal" />
            <p className="text-[12.5px] leading-relaxed text-mid">
              <span className="font-semibold text-hi">Web delivery</span> — the bridge snippet injects
              tsp.* events into your dataLayer for the browser container.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <Layers className="mt-0.5 h-4 w-4 text-teal" />
            <p className="text-[12.5px] leading-relaxed text-mid">
              <span className="font-semibold text-hi">Hybrid dedup</span> — browser and server events share
              event_id so platforms drop duplicates automatically.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
