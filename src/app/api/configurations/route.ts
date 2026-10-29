import { NextResponse } from "next/server";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { configurations } from "@/db/schema";
import type { WizardData } from "@/lib/tracksetup/types";
import { normalizeShopifyHandle } from "@/lib/tracksetup/types";
import { validateAll } from "@/lib/tracksetup/validate";
import { buildPackagePlan } from "@/lib/tracksetup/plan";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const rows = await db
      .select()
      .from(configurations)
      .orderBy(desc(configurations.createdAt))
      .limit(60);
    return NextResponse.json({ configurations: rows });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  let payload: WizardData;
  try {
    payload = (await req.json()) as WizardData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const errors = validateAll(payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Configuration is incomplete — resolve validation errors first", fields: errors },
      { status: 422 },
    );
  }

  const plan = buildPackagePlan(payload);
  const total = plan.reduce((acc, f) => acc + f.bytes, 0);
  const sizeLabel = total >= 1024 ? `${(total / 1024).toFixed(1)} kB` : `${total} B`;

  try {
    const [row] = await db
      .insert(configurations)
      .values({
        storeName: payload.basics.storeName.trim(),
        storeUrl: payload.basics.storeUrl.trim(),
        myshopifyDomain: `${normalizeShopifyHandle(payload.basics.myshopifyDomain)}.myshopify.com`,
        mode: payload.destinations.mode,
        platforms: payload.destinations.platforms,
        packageSize: sizeLabel,
        payload,
      })
      .returning();
    return NextResponse.json({ configuration: row }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Database error" },
      { status: 500 },
    );
  }
}
