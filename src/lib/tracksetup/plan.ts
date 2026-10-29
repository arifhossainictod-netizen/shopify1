import { buildTokenMap, renderTemplate } from "./engine";
import type { WizardData } from "./types";
import { buildWebContainer } from "./templates/web";
import { buildServerContainer } from "./templates/server";
import { buildCustomPixel } from "./templates/pixel";

export interface PlannedFile {
  name: string;
  description: string;
  content: string;
  bytes: number;
}

const byteLen = (s: string) =>
  typeof TextEncoder !== "undefined"
    ? new TextEncoder().encode(s).length
    : Buffer.byteLength(s, "utf8");

/**
 * Exactly three deliverables, always:
 *   gtm-web.json        — import-ready web container
 *   gtm-server.json     — import-ready server container
 *   shopify-custom-pixel.js — single-file Customer Events pixel
 * Compiled from wizard state with placeholder substitution; safe to run
 * in the browser (primary) or on the server (API fallback).
 */
export function buildPackagePlan(data: WizardData): PlannedFile[] {
  const tokens = buildTokenMap(data);

  const raw = [
    {
      name: "gtm-web.json",
      description: "Web container — GTM → Admin → Import container → Merge",
      content: buildWebContainer(data),
    },
    {
      name: "gtm-server.json",
      description: "Server container — import in your sGTM workspace",
      content: buildServerContainer(data),
    },
    {
      name: "shopify-custom-pixel.js",
      description: "Custom Pixel — Shopify Admin → Settings → Customer events → paste",
      content: buildCustomPixel(),
    },
  ];

  return raw.map((f) => ({
    name: f.name,
    description: f.description,
    content: renderTemplate(f.content, tokens),
    bytes: byteLen(renderTemplate(f.content, tokens)),
  }));
}

export const formatBytes = (b: number) =>
  b >= 1024 ? `${(b / 1024).toFixed(1)} kB` : `${b} B`;
