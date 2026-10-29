"use client";

import { motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Basics",
    desc: "Store name, live URL and the permanent .myshopify.com handle — validated as you type so the compiler never stamps a bad identity.",
    chips: ["identity", "url validation"],
  },
  {
    n: "02",
    title: "Destinations",
    desc: "Web, server or hybrid delivery. Multi-select six platforms; credential fields materialize per destination with format guards.",
    chips: ["ga4", "meta capi", "tiktok eapi"],
  },
  {
    n: "03",
    title: "Containers",
    desc: "Web + server GTM ids and your tagging server URL become the compiled transport endpoint — no regex surgery by hand.",
    chips: ["gtm-xxx", "transport path"],
  },
  {
    n: "04",
    title: "Events & privacy",
    desc: "Toggle the funnel, flip SHA-256 hashing and Consent Mode v2, pick your CMP. Defaults are compiled, not documented.",
    chips: ["10 events", "sha-256", "cmp"],
  },
  {
    n: "05",
    title: "Review & package",
    desc: "A pre-flight linter blocks broken configs, then the template engine compiles gtm-web.json, gtm-server.json and the pixel into a .zip.",
    chips: ["pre-flight", "jszip"],
  },
];

export default function HowItWorks() {
  return (
    <section id="how" className="relative z-10 mx-auto max-w-7xl px-5 py-28 lg:px-8">
      <div className="mb-16 max-w-2xl">
        <p className="kicker">The pipeline</p>
        <h2 className="mt-3 text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          Five steps in.
          <br />
          <span className="text-mid">A production package out.</span>
        </h2>
      </div>

      <div>
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.5, delay: i * 0.04 }}
            className="group grid items-start gap-4 border-t border-line py-8 transition-colors last:border-b hover:bg-panel/30 sm:grid-cols-[90px_1fr_auto] sm:gap-8"
          >
            <span className="font-mono text-[13px] font-semibold text-acc opacity-80">{s.n}</span>
            <span>
              <span className="text-[19px] font-semibold tracking-tight text-hi">{s.title}</span>
              <span className="mt-2 block max-w-2xl text-[14px] leading-relaxed text-mid">{s.desc}</span>
              <span className="mt-3 flex flex-wrap gap-2">
                {s.chips.map((c) => (
                  <span key={c} className="chip">
                    {c}
                  </span>
                ))}
              </span>
            </span>
            <Link
              href="/wizard"
              className="hidden h-10 w-10 items-center justify-center rounded-full border border-line2 text-mid transition-all group-hover:border-acc group-hover:text-acc sm:flex"
              aria-label={`Open wizard at ${s.title}`}
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
