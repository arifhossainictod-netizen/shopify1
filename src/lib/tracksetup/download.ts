"use client";

import { buildPackagePlan } from "./plan";
import type { WizardData } from "./types";
import { normalizeShopifyHandle } from "./types";

export function packageFileName(data: WizardData): string {
  const handle = normalizeShopifyHandle(data.basics.myshopifyDomain) || "store";
  const stamp = new Date().toISOString().replace(/[-:]|\.\d+Z$/g, "").slice(0, 12);
  return `tracksetup-pro-${handle}-${stamp}.zip`;
}

/**
 * Compile + zip in the browser. No network round-trip: templates render
 * client-side, JSZip streams a Blob, and an anchor triggers the download.
 * JSZip is code-split and fetched only on first click.
 */
export async function downloadPackage(payload: WizardData): Promise<{ ok: boolean; error?: string }> {
  try {
    const files = buildPackagePlan(payload);
    const { default: JSZip } = await import("jszip");
    const zip = new JSZip();
    for (const f of files) {
      zip.file(f.name, f.content);
    }
    const blob = await zip.generateAsync({
      type: "blob",
      compression: "DEFLATE",
      compressionOptions: { level: 9 },
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = packageFileName(payload);
    a.rel = "noopener";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return { ok: true };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Client compile failed" };
  }
}
