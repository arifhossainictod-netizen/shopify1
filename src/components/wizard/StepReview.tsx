"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Database,
  Download,
  FileArchive,
  Loader2,
  RotateCcw,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useWizardStore } from "@/lib/tracksetup/store";
import { runPreflight, blockersCount, warningsCount } from "@/lib/tracksetup/preflight";
import { buildPackagePlan, formatBytes } from "@/lib/tracksetup/plan";
import { downloadPackage } from "@/lib/tracksetup/download";
import { SectionTitle } from "./ui";

export default function StepReview() {
  const { data, markSaved, zipReady, setZipReady, reset } = useWizardStore();
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "building" | "done" | "error">("idle");
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const issues = useMemo(() => runPreflight(data), [data]);
  const plan = useMemo(() => buildPackagePlan(data), [data]);
  const blockers = blockersCount(issues);
  const warnings = warningsCount(issues);
  const totalBytes = plan.reduce((a, f) => a + f.bytes, 0);

  const generate = async () => {
    if (blockers > 0) return;
    setStatus("building");
    setErrorMsg(null);
    const res = await downloadPackage(data);
    if (res.ok) {
      setStatus("done");
      setZipReady(true);
    } else {
      setStatus("error");
      setErrorMsg(res.error ?? "Unknown error");
    }
  };

  const save = async () => {
    setSaveStatus("saving");
    setErrorMsg(null);
    try {
      const res = await fetch("/api/configurations", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const body = (await res.json().catch(() => ({}))) as { configuration?: { id: string }; error?: string };
      if (!res.ok || !body.configuration) {
        setSaveStatus("error");
        setErrorMsg(body.error ?? "Save failed");
        return;
      }
      markSaved(body.configuration.id);
      setSaveStatus("saved");
    } catch (e) {
      setSaveStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Network error");
    }
  };

  return (
    <div>
      <SectionTitle
        kicker="Step 05 — Review & Package"
        title="Pre-flight, then ship"
        desc="The linter gates compilation — blockers disable the download, warnings are safe to ship. Three files, byte-fresh, generated in your browser."
      />

      <div className="grid gap-5 xl:grid-cols-[1.15fr_1fr]">
        {/* Preflight */}
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <p className="code-label">Pre-flight checks</p>
            <div className="flex gap-2">
              <span className="chip border-red/40 text-red">{blockers} blocking</span>
              <span className="chip border-amber/40 text-amber">{warnings} warning</span>
              <span className="chip border-green/40 text-green">
                {issues.filter((i) => i.level === "pass").length} pass
              </span>
            </div>
          </div>
          <ul className="space-y-2.5">
            {issues.map((issue, i) => (
              <motion.li
                key={`${issue.title}-${i}`}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03, duration: 0.3 }}
                className={`flex items-start gap-3 rounded-lg border px-3.5 py-3 ${
                  issue.level === "blocker"
                    ? "border-red/35 bg-red/[0.05]"
                    : issue.level === "warning"
                      ? "border-amber/30 bg-amber/[0.05]"
                      : "border-green/25 bg-green/[0.04]"
                }`}
              >
                {issue.level === "blocker" ? (
                  <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-red" />
                ) : issue.level === "warning" ? (
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber" />
                ) : (
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green" />
                )}
                <div>
                  <p className="text-[13px] font-semibold text-hi">{issue.title}</p>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-mid">{issue.detail}</p>
                </div>
              </motion.li>
            ))}
          </ul>
        </section>

        {/* Manifest + actions */}
        <div className="flex flex-col gap-5">
          <section className="panel p-5">
            <div className="mb-4 flex items-center justify-between">
              <p className="code-label">Package manifest</p>
              <span className="chip">{formatBytes(totalBytes)}</span>
            </div>
            <ul className="space-y-2">
              {plan.map((f) => (
                <li key={f.name} className="flex items-center justify-between gap-3 border-b border-line/60 pb-2 last:border-0 last:pb-0">
                  <span className="truncate font-mono text-[12px] text-hi">{f.name}</span>
                  <span className="font-mono text-[11px] text-dim">{formatBytes(f.bytes)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-line bg-panel2/60 p-3">
              <FileArchive className="mt-0.5 h-4 w-4 shrink-0 text-teal" />
              <p className="text-[11.5px] leading-relaxed text-mid">
                Exactly three files, compiled in your browser with placeholder substitution — every
                download is instant, byte-fresh, and works offline. The pixel boots the web container
                inside Shopify&apos;s Customer Events sandbox, so no theme edits are needed.
              </p>
            </div>
          </section>

          <section className="panel p-5">
            <div className="mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-acc" />
              <p className="code-label">Ship it</p>
            </div>

            {blockers > 0 ? (
              <p className="mb-4 rounded-lg border border-red/40 bg-red/[0.06] p-3 text-[12.5px] leading-relaxed text-red">
                {blockers} blocker{blockers === 1 ? "" : "s"} — resolve the red checks above to unlock the package.
              </p>
            ) : null}

            {errorMsg ? (
              <p className="mb-4 rounded-lg border border-red/40 bg-red/[0.06] p-3 text-[12.5px] text-red">
                {errorMsg}
              </p>
            ) : null}

            <div className="flex flex-col gap-2.5">
              <button
                type="button"
                onClick={generate}
                disabled={blockers > 0 || status === "building"}
                className="btn btn-acc w-full py-3 text-[15px]"
              >
                {status === "building" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Compiling templates…
                  </>
                ) : status === "done" || zipReady ? (
                  <>
                    <Download className="h-4 w-4" />
                    Download .zip again
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Compile & download .zip
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={save}
                disabled={blockers > 0 || saveStatus === "saving"}
                className="btn btn-line w-full"
              >
                {saveStatus === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : saveStatus === "saved" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green" />
                    Saved to workspace
                  </>
                ) : (
                  <>
                    <Database className="h-4 w-4" />
                    Save setup to workspace
                  </>
                )}
              </button>
            </div>

            {saveStatus === "saved" || (status === "done") ? (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 rounded-xl border border-acc/35 bg-acc/[0.07] p-4"
              >
                <p className="flex items-center gap-2 text-[13px] font-semibold text-acc">
                  <CheckCircle2 className="h-4 w-4" />
                  Package ready — now paste, import, publish.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" className="btn btn-line px-3 py-1.5 text-[11px]" onClick={() => router.push("/setups")}>
                    View saved setups
                  </button>
                  <button
                    type="button"
                    className="btn btn-ghost px-3 py-1.5 text-[11px]"
                    onClick={() => {
                      reset();
                      router.refresh();
                    }}
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Start over
                  </button>
                </div>
              </motion.div>
            ) : null}
          </section>

          {/* Summary strip */}
          <section className="panel p-5">
            <p className="code-label mb-3">Configuration snapshot</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-[12px]">
              <span className="text-dim">mode</span>
              <span className="text-right font-mono text-teal">{data.destinations.mode}</span>
              <span className="text-dim">platforms</span>
              <span className="text-right font-mono text-hi">{data.destinations.platforms.join(", ") || "—"}</span>
              <span className="text-dim">events</span>
              <span className="text-right font-mono text-hi">{data.events.selected.length} enabled</span>
              <span className="text-dim">web container</span>
              <span className="text-right font-mono text-hi">{data.containers.webGtmId || "—"}</span>
              <span className="text-dim">server container</span>
              <span className="text-right font-mono text-hi">{data.containers.serverGtmId || "—"}</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
