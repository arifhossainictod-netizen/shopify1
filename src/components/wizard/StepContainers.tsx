"use client";

import { Container, Network, Route } from "lucide-react";
import { useWizardStore } from "@/lib/tracksetup/store";
import { Field, SectionTitle, TextInput } from "./ui";

export default function StepContainers() {
  const { data, errors, setContainers, clearError } = useWizardStore();
  const needWeb = data.destinations.mode !== "server";
  const needServer = data.destinations.mode !== "web";
  const endpoint = `${(data.containers.taggingServerUrl || "https://gtm.your-domain.com").replace(/\/$/, "")}/${data.containers.transportPath || "_tsp"}`;

  return (
    <div>
      <SectionTitle
        kicker="Step 03 — Containers"
        title="Point the compiler at your GTM accounts"
        desc="The container public ids are stamped into the export files; the tagging server URL becomes the transport endpoint for server-side delivery."
      />

      <div className="grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Web GTM container ID"
            hint={needWeb ? "required" : "skipped in server mode"}
            error={errors.webGtmId}
          >
            <TextInput
              value={data.containers.webGtmId}
              onChange={(v) => {
                setContainers("webGtmId", v.toUpperCase());
                clearError("webGtmId");
              }}
              placeholder="GTM-5TQ7Z2K"
              error={Boolean(errors.webGtmId)}
              icon={<Container className="h-4 w-4" />}
              disabled={!needWeb}
              monospace
            />
          </Field>

          <Field
            label="Server GTM container ID"
            hint={needServer ? "required" : "optional"}
            error={errors.serverGtmId}
          >
            <TextInput
              value={data.containers.serverGtmId}
              onChange={(v) => {
                setContainers("serverGtmId", v.toUpperCase());
                clearError("serverGtmId");
              }}
              placeholder="GTM-S9D4M2P1"
              error={Boolean(errors.serverGtmId)}
              icon={<ServerDot />}
              disabled={!needServer}
              monospace
            />
          </Field>
        </div>

        {needServer ? (
          <>
            <Field
              label="Tagging server URL"
              hint="first-party domain"
              error={errors.taggingServerUrl}
            >
              <TextInput
                value={data.containers.taggingServerUrl}
                onChange={(v) => {
                  setContainers("taggingServerUrl", v);
                  clearError("taggingServerUrl");
                }}
                placeholder="https://gtm.northwind-supply.com"
                error={Boolean(errors.taggingServerUrl)}
                icon={<Network className="h-4 w-4" />}
                monospace
              />
            </Field>

            <Field
              label="Transport path"
              hint="no leading slash"
              error={errors.transportPath}
            >
              <TextInput
                value={data.containers.transportPath}
                onChange={(v) => {
                  setContainers("transportPath", v.replace(/^\/+/, ""));
                  clearError("transportPath");
                }}
                placeholder="_tsp"
                error={Boolean(errors.transportPath)}
                icon={<Route className="h-4 w-4" />}
                monospace
              />
            </Field>

            <div className="rounded-xl border border-teal/25 bg-teal/[0.05] p-4">
              <p className="code-label mb-2">Transport endpoint (compiled)</p>
              <p className="break-all font-mono text-[13px] text-teal">{endpoint}</p>
              <p className="mt-2 text-[12px] leading-relaxed text-mid">
                The Shopify pixel posts here; the sGTM transport client claims it and promotes the JSON
                body into event data. Route this path to your server container (Cloud Run / App Engine / stape).
              </p>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-line bg-panel2/50 p-4">
            <p className="text-[12.5px] leading-relaxed text-mid">
              <span className="font-semibold text-hi">Web-only mode:</span> no tagging server required.
              The package will skip the server container and transport config, and the pixel will push
              events straight into the dataLayer bridge.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ServerDot() {
  return <span className="font-mono text-[10px]">sGTM</span>;
}
