import type { Metadata } from "next";
import Link from "next/link";
import { desc } from "drizzle-orm";
import { ArrowLeft, Plus, Radar } from "lucide-react";
import { db } from "@/db";
import { configurations } from "@/db/schema";
import SetupsList from "@/components/setups/SetupsList";
import type { WizardData } from "@/lib/tracksetup/types";

export const metadata: Metadata = {
  title: "Saved setups — TrackSetup Pro",
  description: "Your compiled tracking configurations, ready to re-download as byte-fresh packages.",
};

export const dynamic = "force-dynamic";

export interface SetupRow {
  id: string;
  storeName: string;
  storeUrl: string;
  myshopifyDomain: string;
  mode: string;
  platforms: string[];
  packageSize: string;
  createdAt: string;
  payload: WizardData;
}

export default async function SetupsPage() {
  let rows: SetupRow[] = [];
  let dbError: string | null = null;
  try {
    const raw = await db.select().from(configurations).orderBy(desc(configurations.createdAt)).limit(60);
    rows = raw.map((r) => ({
      id: r.id,
      storeName: r.storeName,
      storeUrl: r.storeUrl,
      myshopifyDomain: r.myshopifyDomain,
      mode: r.mode,
      platforms: r.platforms,
      packageSize: r.packageSize,
      createdAt: r.createdAt.toISOString(),
      payload: r.payload,
    }));
  } catch (e) {
    dbError = e instanceof Error ? e.message : "Database unavailable";
  }

  return (
    <div className="grid-bg noise relative min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-line bg-void/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-acc">
              <Radar className="h-4 w-4 text-acc-ink" />
            </span>
            <span className="text-[15px] font-bold tracking-tight">
              TrackSetup<span className="text-acc"> Pro</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/" className="btn btn-ghost px-3.5 py-2 text-[12px]">
              <ArrowLeft className="h-3.5 w-3.5" />
              Home
            </Link>
            <Link href="/wizard" className="btn btn-acc px-4 py-2 text-[12.5px]">
              <Plus className="h-3.5 w-3.5" />
              New setup
            </Link>
          </div>
        </div>
      </header>

      <main className="relative z-10 mx-auto max-w-6xl px-5 py-14 lg:px-8">
        <p className="kicker">Workspace</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <h1 className="text-[clamp(2.2rem,5vw,3.4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            Saved setups
          </h1>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
            {rows.length} configuration{rows.length === 1 ? "" : "s"}
          </p>
        </div>
        <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-mid">
          Every saved configuration recompiles on demand — platform IDs, tokens and consent defaults are
          re-injected into fresh templates at download time.
        </p>

        {dbError ? (
          <div className="mt-10 rounded-xl border border-amber/40 bg-amber/[0.06] p-5 text-[13px] text-amber">
            Database not reachable yet — saved setups will appear here once PostgreSQL is provisioned.
            <span className="block mt-1 font-mono text-[11px] text-dim">{dbError}</span>
          </div>
        ) : null}

        <SetupsList rows={rows} />
      </main>
    </div>
  );
}
