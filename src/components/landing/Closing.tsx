"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Radar } from "lucide-react";

export default function Closing() {
  return (
    <footer className="relative z-10 border-t border-line">
      <div className="mx-auto max-w-7xl px-5 py-24 text-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55 }}
        >
          <p className="kicker">Ship the whole stack</p>
          <h2 className="mx-auto mt-4 max-w-3xl text-[clamp(2.2rem,5.4vw,4rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            Stop hand-editing
            <br />
            <span className="bg-gradient-to-r from-acc to-teal bg-clip-text text-transparent">
              GTM containers.
            </span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-mid">
            Open the wizard, drop in your ids, and download a package your future self will thank you for.
          </p>
          <div className="mt-9 flex justify-center">
            <Link href="/wizard" className="btn btn-acc px-8 py-4 text-[15px]">
              Compile your first package
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-5 px-5 py-8 sm:flex-row lg:px-8">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="grid h-7 w-7 place-items-center rounded-md bg-acc">
              <Radar className="h-3.5 w-3.5 text-acc-ink" />
            </span>
            <span className="text-[14px] font-bold tracking-tight">
              TrackSetup<span className="text-acc"> Pro</span>
            </span>
          </Link>
          <nav className="flex items-center gap-6 font-mono text-[10.5px] uppercase tracking-[0.2em] text-dim">
            <Link href="/wizard" className="transition-colors hover:text-hi">
              Wizard
            </Link>
            <Link href="/setups" className="transition-colors hover:text-hi">
              Saved setups
            </Link>
            <a href="#preview" className="transition-colors hover:text-hi">
              Output
            </a>
          </nav>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
            © 2026 · compiled in <span className="text-acc">#b4ff3a</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
