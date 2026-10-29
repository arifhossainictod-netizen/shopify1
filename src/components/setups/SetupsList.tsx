"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Loader2, PackagePlus, Trash2, X } from "lucide-react";
import type { SetupRow } from "@/app/setups/page";
import { downloadPackage } from "@/lib/tracksetup/download";

const MODE_STYLE: Record<string, string> = {
  web: "border-teal/40 text-teal",
  server: "border-amber/40 text-amber",
  hybrid: "border-acc/40 text-acc",
};

export default function SetupsList({ rows }: { rows: SetupRow[] }) {
  const [items, setItems] = useState(rows);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const download = async (row: SetupRow) => {
    setBusy(`dl-${row.id}`);
    setNotice(null);
    const res = await downloadPackage(row.payload);
    setBusy(null);
    if (!res.ok) setNotice(res.error ?? "Download failed");
  };

  const remove = async (id: string) => {
    setBusy(`rm-${id}`);
    try {
      const res = await fetch(`/api/configurations/${id}`, { method: "DELETE" });
      if (res.ok) {
        setItems((list) => list.filter((r) => r.id !== id));
      } else {
        setNotice("Delete failed");
      }
    } finally {
      setBusy(null);
      setConfirming(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="mt-12 flex flex-col items-center rounded-2xl border border-dashed border-line2 bg-panel/40 px-6 py-20 text-center">
        <span className="grid h-14 w-14 place-items-center rounded-2xl border border-line bg-panel2">
          <PackagePlus className="h-6 w-6 text-acc" />
        </span>
        <h2 className="mt-6 text-[19px] font-semibold tracking-tight text-hi">No saved setups yet</h2>
        <p className="mt-2 max-w-sm text-[13.5px] leading-relaxed text-mid">
          Run the wizard end-to-end and hit “Save setup to workspace” on the review step to keep a
          re-downloadable configuration here.
        </p>
        <Link href="/wizard" className="btn btn-acc mt-7 px-6 py-3 text-[13.5px]">
          Open the wizard
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-10">
      <AnimatePresence>
        {notice ? (
          <motion.p
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-4 flex items-center justify-between rounded-lg border border-red/40 bg-red/[0.07] px-4 py-3 text-[12.5px] text-red"
          >
            {notice}
            <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss">
              <X className="h-4 w-4" />
            </button>
          </motion.p>
        ) : null}
      </AnimatePresence>

      <ul className="grid gap-4">
        <AnimatePresence initial={false}>
          {items.map((row, i) => {
            const compiledEvents = row.payload?.events?.selected?.length ?? 0;
            return (
              <motion.li
                key={row.id}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ duration: 0.35, delay: i * 0.04 }}
                className="panel group flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate text-[16px] font-semibold tracking-tight text-hi">
                      {row.storeName}
                    </h2>
                    <span className={`chip ${MODE_STYLE[row.mode] ?? ""}`}>{row.mode}</span>
                  </div>
                  <p className="mt-1 truncate font-mono text-[11px] text-dim">
                    {row.myshopifyDomain} · {row.storeUrl}
                  </p>
                  <div className="mt-3 flex flex-wrap items-center gap-1.5">
                    {(Array.isArray(row.platforms) ? row.platforms : []).map((p) => (
                      <span key={p} className="chip">
                        {p}
                      </span>
                    ))}
                    <span className="chip border-green/30 text-green">{compiledEvents} events</span>
                    <span className="chip">{row.packageSize}</span>
                    <span className="chip">
                      {new Date(row.createdAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    onClick={() => download(row)}
                    disabled={busy !== null}
                    className="btn btn-acc px-4 py-2.5 text-[12.5px]"
                  >
                    {busy === `dl-${row.id}` ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Download className="h-3.5 w-3.5" />
                    )}
                    Recompile .zip
                  </button>
                  {confirming === row.id ? (
                    <button
                      type="button"
                      onClick={() => remove(row.id)}
                      disabled={busy !== null}
                      className="btn px-4 py-2.5 text-[12.5px] border border-red/60 text-red hover:bg-red/10"
                    >
                      {busy === `rm-${row.id}` ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
                      Confirm delete
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirming(row.id)}
                      disabled={busy !== null}
                      className="btn btn-ghost px-3 py-2.5"
                      aria-label={`Delete ${row.storeName}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
      </ul>
    </div>
  );
}
