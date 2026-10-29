"use client";

const ITEMS = [
  { name: "Google Analytics 4", color: "#ff8b05" },
  { name: "Meta", color: "#1877f2" },
  { name: "TikTok", color: "#28e6d9" },
  { name: "Pinterest", color: "#e60023" },
  { name: "Snapchat", color: "#fffc00" },
  { name: "Google Ads", color: "#34a853" },
  { name: "GTM Web", color: "#b4ff3a" },
  { name: "GTM Server", color: "#3ce8c2" },
];

export default function Marquee() {
  const row = [...ITEMS, ...ITEMS];
  return (
    <section className="relative z-10 border-y border-line bg-panel/40 py-5">
      <div className="overflow-hidden" style={{ maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)" }}>
        <div className="flex w-max animate-marquee items-center gap-10 pr-10">
          {row.map((item, i) => (
            <span key={i} className="flex items-center gap-10">
              <span className="flex items-center gap-2.5 font-mono text-[12px] font-semibold uppercase tracking-[0.28em] text-mid">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="font-mono text-[10px] text-line2">//</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
