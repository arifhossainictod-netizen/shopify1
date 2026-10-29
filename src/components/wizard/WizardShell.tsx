"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Container,
  FlaskConical,
  Radar,
  Rocket,
  RotateCcw,
  ShieldCheck,
  Store,
  Waypoints,
  Wand2,
} from "lucide-react";
import { useWizardStore } from "@/lib/tracksetup/store";
import StepBasics from "./StepBasics";
import StepDestinations from "./StepDestinations";
import StepContainers from "./StepContainers";
import StepEvents from "./StepEvents";
import StepReview from "./StepReview";

const STEPS = [
  { n: 1, title: "Basics", blurb: "Store identity & URLs", icon: Store },
  { n: 2, title: "Destinations", blurb: "Platforms & credentials", icon: Waypoints },
  { n: 3, title: "Containers", blurb: "GTM ids & tagging server", icon: Container },
  { n: 4, title: "Events & Privacy", blurb: "Signals, hashing, consent", icon: ShieldCheck },
  { n: 5, title: "Review & Package", blurb: "Lint, compile, download", icon: Rocket },
];

export default function WizardShell() {
  const { data, step, errors, next, prev, setStep, fillDemo, reset } = useWizardStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const payloadJson = useMemo(() => JSON.stringify(data, null, 2), [data]);

  const errorCount = Object.keys(errors).length;

  const goNext = () => {
    if (next()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (!mounted) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-void">
        <div className="flex items-center gap-3 font-mono text-[12px] uppercase tracking-[0.3em] text-dim">
          <span className="h-2 w-2 animate-pulse-dot rounded-full bg-acc" />
          restoring session…
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-dvh bg-void text-hi">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b border-line bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-4 px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-acc">
              <Radar className="h-4 w-4 text-acc-ink" />
            </span>
            <span className="text-[15px] font-bold tracking-tight">
              TrackSetup<span className="text-acc"> Pro</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 font-mono text-[10px] uppercase tracking-[0.22em] text-dim md:flex">
            <FlaskConical className="h-3.5 w-3.5 text-teal" />
            <span>
              step <span className="text-hi">{String(step).padStart(2, "0")}</span> / 05 —{" "}
              <span className="text-teal">{STEPS[step - 1].title}</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button type="button" onClick={fillDemo} className="btn btn-line px-3.5 py-2 text-[12px]">
              <Wand2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Autofill demo</span>
            </button>
            <button type="button" onClick={reset} className="btn btn-ghost px-3 py-2 text-[12px]" title="Reset wizard">
              <RotateCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        {/* mobile progress */}
        <div className="h-[2px] bg-line lg:hidden">
          <div
            className="h-full bg-acc transition-all duration-500"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </header>

      <div className="mx-auto grid max-w-[1600px] gap-10 px-5 py-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:px-8 xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        {/* Step rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-28">
            <ol className="relative space-y-1.5">
              <span className="absolute bottom-6 left-[19px] top-6 w-px bg-line" aria-hidden />
              {STEPS.map((s) => {
                const state = step > s.n ? "done" : step === s.n ? "current" : "todo";
                const Icon = s.icon;
                return (
                  <li key={s.n}>
                    <button
                      type="button"
                      onClick={() => s.n <= step && setStep(s.n)}
                      disabled={s.n > step}
                      className={`group relative flex w-full items-start gap-3.5 rounded-xl px-2 py-2.5 text-left transition-colors ${
                        state === "current" ? "bg-panel" : s.n <= step ? "hover:bg-panel/60" : "opacity-55"
                      }`}
                    >
                      <span
                        className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-all ${
                          state === "done"
                            ? "border-acc bg-acc text-acc-ink"
                            : state === "current"
                              ? "border-acc/70 bg-void text-acc"
                              : "border-line2 bg-panel text-dim"
                        }`}
                      >
                        {state === "done" ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                        {state === "current" ? (
                          <span className="absolute -right-0.5 -top-0.5 h-2 w-2 animate-pulse-dot rounded-full bg-acc" />
                        ) : null}
                      </span>
                      <span className="pt-0.5">
                        <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-dim">
                          step 0{s.n}
                          {s.n < step ? <span className="text-acc">done</span> : null}
                        </span>
                        <span className={`block text-[14px] font-semibold ${state === "current" ? "text-hi" : "text-mid group-hover:text-hi"}`}>
                          {s.title}
                        </span>
                        <span className="block text-[11px] text-dim">{s.blurb}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ol>

            <div className="mt-8 rounded-xl border border-line bg-panel p-4">
              <p className="code-label mb-2">Session</p>
              <p className="truncate text-[13px] font-semibold text-hi">
                {data.basics.storeName || "Unnamed store"}
              </p>
              <p className="truncate font-mono text-[10.5px] text-dim">
                {data.basics.myshopifyDomain || "—"}.myshopify.com
              </p>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="chip border-teal/40 text-teal">{data.destinations.mode}</span>
                <span className="chip">{data.destinations.platforms.length} platforms</span>
                <span className="chip">{data.events.selected.length} events</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Step content */}
        <main className="min-w-0">
          {errorCount > 0 ? (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 rounded-xl border border-red/40 bg-red/[0.07] p-4 text-[13px] leading-relaxed text-red"
            >
              {errorCount} field{errorCount === 1 ? "" : "s"} need attention — check the highlighted inputs below.
            </motion.div>
          ) : null}

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
            >
              {step === 1 ? <StepBasics /> : null}
              {step === 2 ? <StepDestinations /> : null}
              {step === 3 ? <StepContainers /> : null}
              {step === 4 ? <StepEvents /> : null}
              {step === 5 ? <StepReview /> : null}
            </motion.div>
          </AnimatePresence>

          {/* Nav */}
          <div className="mt-10 flex items-center justify-between border-t border-line pt-6">
            <button
              type="button"
              onClick={prev}
              disabled={step === 1}
              className="btn btn-ghost px-4 py-2.5 text-[13px]"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>
            {step < 5 ? (
              <button type="button" onClick={goNext} className="btn btn-acc px-6 py-2.5 text-[13.5px]">
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            ) : (
              <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                compile in the review panel
                <ChevronRight className="h-3.5 w-3.5" />
              </p>
            )}
          </div>
        </main>

        {/* Live payload */}
        <aside className="hidden xl:block">
          <div className="sticky top-28">
            <div className="overflow-hidden rounded-xl border border-line bg-[#070b0d]">
              <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
                <span className="code-label">live payload</span>
                <span className="flex gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-red/70" />
                  <span className="h-2 w-2 rounded-full bg-amber/70" />
                  <span className="h-2 w-2 rounded-full bg-green/70" />
                </span>
              </div>
              <pre className="max-h-[70vh] overflow-auto p-4 font-mono text-[10.5px] leading-relaxed text-mid">
                {payloadJson}
              </pre>
            </div>
            <p className="mt-3 text-center font-mono text-[9.5px] uppercase tracking-[0.2em] text-dim">
              persisted locally — sent only at compile
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
