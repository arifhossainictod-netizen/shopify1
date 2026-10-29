import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Space_Grotesk, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk" });
const mono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jbmono" });

export const metadata: Metadata = {
  title: "TrackSetup Pro — Tracking pipelines, compiled",
  description:
    "The automated wizard that compiles import-ready GTM containers, server-side tagging configs and Shopify Custom Pixels for Shopify merchants — in under 3 minutes.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${mono.variable}`}>
      <body className="bg-void text-hi font-display antialiased">{children}</body>
    </html>
  );
}
