"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Play } from "lucide-react";

const TERM_LINES: { p: string; t: string; cls: string }[] = [
  { p: "$", t: "tsp compile --store northwind-supply", cls: "text-hi" },
  { p: "→", t: "hydrating placeholders × 168", cls: "text-teal" },
  { p: "→", t: "gtm-web.json · 18 tags · 10 triggers · 9 vars", cls: "text-teal" },
  { p: "→", t: "gtm-server.json · 3 clients · 14 tags", cls: "text-teal" },
  { p: "→", t: "shopify-custom-pixel.js · sandbox GTM boot", cls: "text-teal" },
  { p: "→", t: "consent: v2 defaults (denied)", cls: "text-teal" },
  { p: "→", t: "3 files · zipping client-side", cls: "text-teal" },
  { p: "✓", t: "tracksetup-pro-northwind-supply.zip", cls: "text-acc" },
  { p: "$", t: "shipped in 172s — no consultant harmed", cls: "text-hi" },
];

function Terminal() {
  const [lineIdx, setLineIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);

  useEffect(() => {
    if (lineIdx >= TERM_LINES.length) {
      const t = setTimeout(() => {
        setLineIdx(0);
        setCharIdx(0);
      }, 4200);
      return () => clearTimeout(t);
    }
    const line = TERM_LINES[lineIdx];
    if (charIdx < line.t.length) {
      const t = setTimeout(() => setCharIdx((c) => c + 1), 14 + Math.random() * 22);
      return () => clearTimeout(t);
    }
    const t = setTimeout(() => {
      setLineIdx((l) => l + 1);
      setCharIdx(0);
    }, 340);
    return () => clearTimeout(t);
  }, [lineIdx, charIdx]);

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-[#070b0d]/90 shadow-[0_40px_80px_-40px_rgba(180,255,58,0.15)] backdrop-blur">
      <div className="flex items-center justify-between border-b border-line px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-red/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber/70" />
          <span className="h-2.5 w-2.5 rounded-full bg-green/70" />
        </div>
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          tsp — compile.log
        </span>
      </div>
      <div className="h-[290px] p-5 font-mono text-[12px] leading-[1.9] sm:text-[13px]">
        {TERM_LINES.slice(0, lineIdx).map((l, i) => (
          <div key={i} className="flex gap-2.5">
            <span className={l.p === "$" ? "text-dim" : l.p === "✓" ? "text-green" : "text-teal"}>{l.p}</span>
            <span className={l.cls}>{l.t}</span>
          </div>
        ))}
        {lineIdx < TERM_LINES.length ? (
          <div className="flex gap-2.5">
            <span className={TERM_LINES[lineIdx].p === "$" ? "text-dim" : TERM_LINES[lineIdx].p === "✓" ? "text-green" : "text-teal"}>
              {TERM_LINES[lineIdx].p}
            </span>
            <span className={TERM_LINES[lineIdx].cls}>
              {TERM_LINES[lineIdx].t.slice(0, charIdx)}
              <span className="animate-pulse-dot text-acc">▊</span>
            </span>
          </div>
        ) : (
          <div className="flex gap-2.5">
            <span className="text-dim">$</span>
            <span className="animate-pulse-dot text-acc">▊</span>
          </div>
        )}
      </div>
    </div>
  );
}

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

export default function Hero() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 pb-24 pt-28 sm:pt-36 lg:px-8">
      <div className="grid items-center gap-14 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <motion.div {...fadeUp} transition={{ duration: 0.5 }}>
            <span className="inline-flex items-center gap-2 rounded-full border border-line2 bg-panel/70 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-mid">
              <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-acc" />
              Consent Mode v2 native · engine v1.4
            </span>
          </motion.div>

          <motion.h1
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="mt-6 text-[clamp(2.9rem,7.4vw,5.4rem)] font-bold leading-[0.98] tracking-[-0.035em]"
          >
            Shopify tracking,
            <br />
            <span className="bg-gradient-to-r from-acc via-teal to-acc bg-clip-text text-transparent">
              compiled.
            </span>
          </motion.h1>

          <motion.p
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="mt-6 max-w-xl text-[16.5px] leading-relaxed text-mid"
          >
            TrackSetup Pro interviews your stack, compiles import-ready GTM web &amp; server
            containers plus a Shopify Custom Pixel, then hands you a byte-fresh .zip.
            What used to take a consultant three hours now takes three minutes.
          </motion.p>

          <motion.div
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.24 }}
            className="mt-9 flex flex-wrap items-center gap-3.5"
          >
            <Link href="/wizard" className="btn btn-acc px-7 py-3.5 text-[15px]">
              Open the wizard
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a href="#preview" className="btn btn-line px-6 py-3.5 text-[15px]">
              <Play className="h-4 w-4" />
              See the output
            </a>
          </motion.div>

          <motion.dl
            {...fadeUp}
            transition={{ duration: 0.55, delay: 0.34 }}
            className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-7"
          >
            {[
              ["3 min", "median build time"],
              ["6", "destination APIs"],
              ["0", "consultants needed"],
            ].map(([v, l]) => (
              <div key={l}>
                <dt className="text-[26px] font-bold tracking-tight text-hi">
                  {v}
                </dt>
                <dd className="mt-1 font-mono text-[9.5px] uppercase tracking-[0.18em] text-dim">{l}</dd>
              </div>
            ))}
          </motion.dl>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 32, rotate: 0.5 }}
          animate={{ opacity: 1, y: 0, rotate: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="relative"
        >
          <div className="pointer-events-none absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_60%_20%,rgba(180,255,58,0.09),transparent_60%)]" />
          <div className="animate-float">
            <Terminal />
          </div>
          <div className="pointer-events-none absolute -bottom-6 -left-6 hidden rounded-xl border border-line bg-panel px-4 py-3 font-mono text-[10px] uppercase tracking-[0.18em] text-teal shadow-xl sm:block">
            sha-256 · dedup · consent
          </div>
        </motion.div>
      </div>
    </section>
  );
}
