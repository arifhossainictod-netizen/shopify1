"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

export function Field({
  label,
  hint,
  error,
  children,
  mono,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-baseline justify-between gap-3">
        <span className="text-[13px] font-medium text-hi">{label}</span>
        {hint ? <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">{hint}</span> : null}
      </span>
      {children}
      {error ? (
        <span className="mt-2 flex items-start gap-1.5 text-[12px] text-red">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </span>
      ) : null}
      {mono ? null : null}
    </label>
  );
}

export function TextInput({
  value,
  onChange,
  placeholder,
  error,
  icon,
  type = "text",
  secret = false,
  monospace = false,
  disabled = false,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: boolean;
  icon?: ReactNode;
  type?: "text" | "email" | "password" | "url";
  secret?: boolean;
  monospace?: boolean;
  disabled?: boolean;
}) {
  const [show, setShow] = useState(false);
  const inputType = secret ? (show ? "text" : "password") : type;
  return (
    <div className="relative">
      {icon ? <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-dim">{icon}</div> : null}
      <input
        className={`input ${icon ? "pl-10" : ""} ${secret ? "pr-11" : ""} ${monospace ? "font-mono text-[13px]" : ""}`}
        data-error={error ? "true" : undefined}
        type={inputType}
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        spellCheck={false}
        autoComplete="off"
      />
      {secret ? (
        <button
          type="button"
          aria-label={show ? "Hide secret" : "Show secret"}
          onClick={() => setShow((s) => !s)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-dim transition-colors hover:text-hi"
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      ) : null}
    </div>
  );
}

export function Toggle({
  checked,
  onChange,
  label,
  desc,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  desc?: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="group flex w-full items-start justify-between gap-4 rounded-xl border border-line bg-panel2/60 p-4 text-left transition-colors hover:border-line2"
    >
      <span>
        <span className="block text-[13.5px] font-semibold text-hi">{label}</span>
        {desc ? <span className="mt-1 block text-[12px] leading-relaxed text-mid">{desc}</span> : null}
      </span>
      <span
        className={`mt-0.5 flex h-6 w-11 shrink-0 items-center rounded-full border px-0.5 transition-colors duration-200 ${
          checked ? "justify-end border-acc/60 bg-acc" : "justify-start border-line2 bg-void"
        }`}
      >
        <motion.span
          layout
          className={`h-[18px] w-[18px] rounded-full ${checked ? "bg-acc-ink" : "bg-dim"}`}
          transition={{ type: "spring", stiffness: 500, damping: 34 }}
        />
      </span>
    </button>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { id: T; label: string; desc: string; tag?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {options.map((o) => {
        const active = value === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            className={`relative overflow-hidden rounded-xl border p-4 text-left transition-all duration-200 ${
              active ? "border-acc/70 bg-acc/[0.06]" : "border-line bg-panel2/60 hover:border-line2"
            }`}
          >
            <span className="flex items-center justify-between gap-2">
              <span className={`text-[14px] font-semibold ${active ? "text-acc" : "text-hi"}`}>{o.label}</span>
              {o.tag ? (
                <span className="rounded-full border border-teal/40 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-teal">
                  {o.tag}
                </span>
              ) : null}
            </span>
            <span className="mt-1.5 block text-[12px] leading-relaxed text-mid">{o.desc}</span>
            {active ? (
              <motion.span
                layoutId="seg-active-glow"
                className="pointer-events-none absolute -right-6 -top-6 h-16 w-16 rounded-full bg-acc/20 blur-2xl"
              />
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

export function SectionTitle({ kicker, title, desc }: { kicker: string; title: string; desc?: string }) {
  return (
    <div className="mb-6">
      <p className="kicker">{kicker}</p>
      <h2 className="mt-2 text-2xl font-bold tracking-tight text-hi sm:text-[1.7rem]">{title}</h2>
      {desc ? <p className="mt-2 max-w-xl text-[13.5px] leading-relaxed text-mid">{desc}</p> : null}
    </div>
  );
}
