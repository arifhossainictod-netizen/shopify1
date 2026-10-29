import type { Metadata } from "next";
import WizardShell from "@/components/wizard/WizardShell";

export const metadata: Metadata = {
  title: "Wizard — TrackSetup Pro",
  description: "Five steps to a production-grade tracking package: GTM containers, server tagging config, and a Shopify Custom Pixel.",
};

export default function WizardPage() {
  return <WizardShell />;
}
