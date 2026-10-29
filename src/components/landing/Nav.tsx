import Link from "next/link";
import { ArrowRight, Radar } from "lucide-react";

export default function Nav() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-line/60 bg-void/70 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-acc">
            <Radar className="h-4 w-4 text-acc-ink" />
          </span>
          <span className="text-[15px] font-bold tracking-tight">
            TrackSetup<span className="text-acc"> Pro</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-8 font-mono text-[10.5px] uppercase tracking-[0.22em] text-mid md:flex">
          <a href="#how" className="transition-colors hover:text-hi">
            Pipeline
          </a>
          <a href="#preview" className="transition-colors hover:text-hi">
            Output
          </a>
          <Link href="/setups" className="transition-colors hover:text-hi">
            Saved setups
          </Link>
        </nav>
        <Link href="/wizard" className="btn btn-acc px-4.5 py-2 text-[12.5px] sm:px-5">
          Open wizard
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </header>
  );
}
