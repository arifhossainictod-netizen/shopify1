"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileCode2, FileJson2, PackageCheck } from "lucide-react";

type Tok = { t: string; c?: "acc" | "teal" | "dim" | "amber" | "mid" };
type Line = Tok[];

const FILES: { id: string; label: string; icon: typeof FileJson2; lines: Line[] }[] = [
  {
    id: "web",
    label: "gtm-web.json",
    icon: FileJson2,
    lines: [
      [{ t: "{" }],
      [{ t: '  "exportFormatVersion": 2,', c: "mid" }],
      [{ t: '  "containerVersion": {', c: "mid" }],
      [{ t: '    "container": { ', c: "mid" }, { t: '"publicId": ', c: "mid" }, { t: '"GTM-5TQ7Z2K"', c: "acc" }, { t: " },", c: "mid" }],
      [{ t: '    "tag": [', c: "mid" }],
      [{ t: "      {", c: "mid" }],
      [{ t: '        "name": ', c: "mid" }, { t: '"GA4 • Add to Cart"', c: "acc" }, { t: ",", c: "mid" }],
      [{ t: '        "type": "gaawe",', c: "teal" }],
      [{ t: '        "parameter": [{ ', c: "mid" }, { t: '"eventName": ', c: "mid" }, { t: '"add_to_cart"', c: "amber" }, { t: " }]", c: "mid" }],
      [{ t: '        "firingTriggerId": ["2014"]', c: "mid" }],
      [{ t: "      },", c: "mid" }],
      [{ t: '      { ', c: "mid" }, { t: '"name": ', c: "mid" }, { t: '"Meta • Purchase"', c: "acc" }, { t: ', … }', c: "mid" }],
      [{ t: "    ],", c: "mid" }],
      [{ t: '    "trigger": [{ ', c: "mid" }, { t: '"eventName": ', c: "mid" }, { t: '"tsp.add_to_cart"', c: "teal" }, { t: " }]", c: "mid" }],
      [{ t: "  }", c: "mid" }],
      [{ t: "}", c: "mid" }],
    ],
  },
  {
    id: "server",
    label: "gtm-server.json",
    icon: FileJson2,
    lines: [
      [{ t: "{" }],
      [{ t: '  "containerVersion": {', c: "mid" }],
      [{ t: '    "client": [', c: "mid" }],
      [{ t: "      {", c: "mid" }],
      [{ t: '        "name": ', c: "mid" }, { t: '"Client — GA4 (gtag)"', c: "acc" }, { t: ",", c: "mid" }],
      [{ t: '        "type": "sgtmgaawc",', c: "teal" }],
      [{ t: '        "parameter": [{ ', c: "mid" }, { t: '"measurementId": ', c: "mid" }, { t: '"G-9XK2M4PLRD"', c: "amber" }, { t: " }]", c: "mid" }],
      [{ t: "      },", c: "mid" }],
      [{ t: '      { ', c: "mid" }, { t: '"name": ', c: "mid" }, { t: '"Client — TSP Transport (/_tsp)"', c: "acc" }, { t: ', … }', c: "mid" }],
      [{ t: "    ],", c: "mid" }],
      [{ t: '    "tag": [{', c: "mid" }],
      [{ t: '      "name": ', c: "mid" }, { t: '"sGTM • Meta CAPI — Purchase"', c: "acc" }, { t: ",", c: "mid" }],
      [{ t: '      "parameter": [{ ', c: "mid" }, { t: '"event_name": ', c: "mid" }, { t: '"Purchase"', c: "teal" }, { t: " }]", c: "mid" }],
      [{ t: "    }]", c: "mid" }],
      [{ t: "  }", c: "mid" }],
      [{ t: "}", c: "mid" }],
    ],
  },
  {
    id: "pixel",
    label: "shopify-custom-pixel.js",
    icon: FileCode2,
    lines: [
      [{ t: "/* TrackSetup Pro — Shopify Custom Pixel */", c: "dim" }],
      [{ t: "var CONFIG = {", c: "mid" }],
      [{ t: "  mode: ", c: "mid" }, { t: "'HYBRID'", c: "amber" }, { t: ",", c: "mid" }],
      [{ t: "  webGtmId: ", c: "mid" }, { t: "'GTM-5TQ7Z2K'", c: "acc" }, { t: ",", c: "mid" }],
      [{ t: "  transport: ", c: "mid" }, { t: "'https://gtm.northwind-supply.com'", c: "teal" }, { t: ",", c: "mid" }],
      [{ t: "  hashUserData: ", c: "mid" }, { t: "true", c: "acc" }],
      [{ t: "};", c: "mid" }],
      [{ t: "" }],
      [{ t: "bootWeb();  ", c: "acc" }, { t: "// loads GTM inside the sandbox", c: "dim" }],
      [{ t: "analytics.subscribe(", c: "mid" }, { t: "'checkout_completed'", c: "amber" }, { t: ", evt => {", c: "mid" }],
      [{ t: "  DL.push({ event: ", c: "mid" }, { t: "'tsp.purchase'", c: "teal" }, { t: ", ecommerce });", c: "mid" }],
      [{ t: "  beacon(transport, payload);  ", c: "mid" }, { t: "// → sGTM", c: "dim" }],
      [{ t: "});", c: "mid" }],
      [{ t: "// every subscription wired — single-file install", c: "dim" }],
    ],
  },
];

const colorOf = (c?: Tok["c"]) =>
  c === "acc" ? "text-acc" : c === "teal" ? "text-teal" : c === "dim" ? "text-dim" : c === "amber" ? "text-amber" : "text-mid";

export default function OutputPreview() {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setActive((a) => (a + 1) % FILES.length), 5200);
    return () => clearInterval(t);
  }, []);

  const file = FILES[active];

  return (
    <section id="preview" className="relative z-10 mx-auto max-w-7xl px-5 py-28 lg:px-8">
      <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="kicker">What you download</p>
          <h2 className="mt-3 text-[clamp(2rem,4.6vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            Three files. Real GTM import format.
          </h2>
        </div>
        <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
          <PackageCheck className="h-4 w-4 text-acc" />
          compiled in your browser, instantly
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.6 }}
        className="overflow-hidden rounded-2xl border border-line bg-[#070b0d] shadow-[0_60px_120px_-60px_rgba(60,232,194,0.12)]"
      >
        <div className="flex flex-wrap items-center gap-1 border-b border-line bg-panel/60 px-3 py-2">
          {FILES.map((f, i) => {
            const Icon = f.icon;
            const on = i === active;
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => setActive(i)}
                className={`flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-[11px] transition-colors ${
                  on ? "bg-acc/10 text-acc" : "text-dim hover:text-hi"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {f.label}
              </button>
            );
          })}
          <span className="ml-auto hidden font-mono text-[9.5px] uppercase tracking-[0.2em] text-dim sm:block">
            exportFormatVersion 2
          </span>
        </div>

        <div className="relative">
          <div className="grid-bg absolute inset-0 opacity-60" aria-hidden />
          <pre className="relative min-h-[340px] overflow-x-auto p-6 font-mono text-[12px] leading-[1.85] sm:text-[12.5px]">
            {file.lines.map((line, i) => (
              <motion.div
                key={`${file.id}-${i}`}
                initial={{ opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.22, delay: i * 0.03 }}
                className="flex"
              >
                <span className="mr-5 w-5 select-none text-right text-line2">{String(i + 1).padStart(2, "0")}</span>
                <span>
                  {line.map((tok, j) => (
                    <span key={j} className={colorOf(tok.c)}>
                      {tok.t}
                    </span>
                  ))}
                  {line.length === 1 && line[0].t === "" ? " " : null}
                </span>
              </motion.div>
            ))}
          </pre>
        </div>
      </motion.div>
    </section>
  );
}
