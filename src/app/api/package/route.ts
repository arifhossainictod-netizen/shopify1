import { NextResponse } from "next/server";
import JSZip from "jszip";
import type { WizardData } from "@/lib/tracksetup/types";
import { validateAll } from "@/lib/tracksetup/validate";
import { buildPackagePlan } from "@/lib/tracksetup/plan";
import { normalizeShopifyHandle } from "@/lib/tracksetup/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  let payload: WizardData;
  try {
    payload = (await req.json()) as WizardData;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!payload || typeof payload !== "object" || !payload.basics || !payload.destinations) {
    return NextResponse.json({ error: "Malformed wizard payload" }, { status: 400 });
  }

  const errors = validateAll(payload);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json(
      { error: "Validation failed — resolve step errors first", fields: errors },
      { status: 422 },
    );
  }

  try {
    const files = buildPackagePlan(payload);
    const zip = new JSZip();
    for (const f of files) {
      zip.file(f.name, f.content);
    }
    const buffer = await zip.generateAsync({
      type: "uint8array",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    const handle = normalizeShopifyHandle(payload.basics.myshopifyDomain) || "store";
    const stamp = new Date().toISOString().replace(/[-:]|\.\d+Z$/g, "").slice(0, 12);
    const filename = `tracksetup-pro-${handle}-${stamp}.zip`;

    return new Response(Buffer.from(buffer), {
      status: 200,
      headers: {
        "content-type": "application/zip",
        "content-disposition": `attachment; filename="${filename}"`,
        "cache-control": "no-store",
      },
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown compile error";
    return NextResponse.json({ error: `Template compile failed: ${msg}` }, { status: 500 });
  }
}
