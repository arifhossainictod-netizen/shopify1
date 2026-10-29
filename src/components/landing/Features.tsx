"use client";

import { motion } from "framer-motion";
import { ArrowRight, Braces, FileBox, Fingerprint, GitMerge, ScanSearch, ShieldCheck } from "lucide-react";

function Bento({ children, className = "", delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, delay }}
      className={`group relative overflow-hidden rounded-2xl border border-line bg-panel/70 p-6 transition-colors hover:border-line2 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default function Features() {
  return (
    <section className="relative z-10 mx-auto max-w-7xl px-5 py-10 lg:px-8">
      <div className="mb-14 max-w-2xl">
        <p className="kicker">Under the hood</p>
        <h2 className="mt-3 text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          A compiler, not a checklist.
        </h2>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Placeholder compiler — spans 2 */}
        <Bento className="md:col-span-2">
          <Braces className="h-5 w-5 text-acc" />
          <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-hi">Placeholder-native template engine</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mid">
            Master GTM schemas and pixel scripts carry <span className="font-mono text-teal">{"{{TOKENS}}"}</span>. The
            compiler sweeps them with your credentials — GTM's own variables pass through untouched.
          </p>
          <div className="mt-5 overflow-hidden rounded-lg border border-line bg-[#070b0d] font-mono text-[11.5px] leading-loose">
            <div className="border-b border-line px-4 py-2 text-[9.5px] uppercase tracking-[0.22em] text-dim">gtm-web.json — before / after</div>
            <div className="p-4">
              <p className="text-dim">"value": <span className="text-amber">{"{{GA4_MEASUREMENT_ID}}"}</span></p>
              <p className="mt-1 flex items-center gap-2 text-mid">
                <ArrowRight className="h-3 w-3 text-acc" />
                "value": <span className="text-acc">"G-9XK2M4PLRD"</span>
              </p>
            </div>
          </div>
        </Bento>

        {/* Preflight */}
        <Bento delay={0.05}>
          <ScanSearch className="h-5 w-5 text-acc" />
          <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-hi">Pre-flight linter</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mid">
            Eleven rules run before compile: URL shape, platform patterns, mode contradictions, consent gaps.
          </p>
          <div className="mt-5 space-y-2">
            {[
              ["ok", "Purchase wired to GA4 + CAPI", "text-green border-green/30"],
              ["warn", "Meta CAPI token optional", "text-amber border-amber/30"],
              ["ok", "Endpoint claimable over TLS", "text-green border-green/30"],
            ].map(([s, t, c]) => (
              <div key={t} className={`flex items-center gap-2.5 rounded-md border px-3 py-2 font-mono text-[10.5px] ${c}`}>
                <span className="uppercase">{s}</span>
                <span>{t}</span>
              </div>
            ))}
          </div>
        </Bento>

        {/* Consent */}
        <Bento delay={0.08}>
          <ShieldCheck className="h-5 w-5 text-acc" />
          <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-hi">Consent Mode v2, compiled in</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mid">
            Defaults and CMP grants land in the container and <span className="font-mono text-teal">consent/defaults.json</span> — not a wiki page.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <span className="chip border-red/40 text-red">ad_storage: denied</span>
            <span className="chip border-amber/40 text-amber">wait: 500ms</span>
            <span className="chip border-green/40 text-green">analytics → granted</span>
          </div>
        </Bento>

        {/* SHA */}
        <Bento delay={0.11}>
          <Fingerprint className="h-5 w-5 text-acc" />
          <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-hi">SHA-256 user data</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mid">
            em/ph hashed server-side before CAPI. Raw PII never touches a platform endpoint.
          </p>
          <div className="mt-5 rounded-lg border border-line bg-[#070b0d] p-3 font-mono text-[10.5px]">
            <p className="text-dim">em: ops@acme.com</p>
            <p className="shimmer-line mt-1.5 h-2.5 w-4/5 rounded" />
            <p className="mt-1.5 text-teal">→ 8f3c…a91e (64 hex)</p>
          </div>
        </Bento>

        {/* Import ready */}
        <Bento delay={0.14}>
          <FileBox className="h-5 w-5 text-acc" />
          <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-hi">Three files, zero scaffolding</h3>
          <p className="mt-2 text-[13px] leading-relaxed text-mid">
            Real GTM export v2 shape — tags, triggers, DLVs, built-ins. Drop in, publish. Nothing else to paste.
          </p>
          <ul className="mt-5 space-y-1.5 font-mono text-[10.5px] text-mid">
            {["gtm-web.json", "gtm-server.json", "shopify-custom-pixel.js"].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <span className="text-acc">├</span>
                {f}
              </li>
            ))}
            <li className="flex items-center gap-2 pt-1 text-dim">
              <span className="text-line2">└</span>
              compiled client-side · 100% offline
            </li>
          </ul>
        </Bento>

        {/* Dedup */}
        <Bento className="md:col-span-2" delay={0.17}>
          <GitMerge className="h-5 w-5 text-acc" />
          <h3 className="mt-4 text-[17px] font-semibold tracking-tight text-hi">Hybrid deduplication, guaranteed</h3>
          <p className="mt-2 max-w-md text-[13px] leading-relaxed text-mid">
            Browser and server events share the same event_id. Platforms drop the duplicate; your ROAS
            stops lying. The compiler wires it — you never think about it again.
          </p>
          <div className="mt-5 flex items-center gap-3 font-mono text-[10px] text-mid">
            <span className="rounded border border-line bg-[#070b0d] px-3 py-2">browser · evt_9f2</span>
            <span className="text-acc">╲</span>
            <span className="rounded border border-acc/50 bg-acc/10 px-3 py-2 text-acc">single platform hit</span>
            <span className="text-acc">╱</span>
            <span className="rounded border border-line bg-[#070b0d] px-3 py-2">server · evt_9f2</span>
          </div>
        </Bento>
      </div>
    </section>
  );
}
