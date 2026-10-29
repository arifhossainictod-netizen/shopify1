import Background from "@/components/landing/Background";
import Nav from "@/components/landing/Nav";
import Hero from "@/components/landing/Hero";
import Marquee from "@/components/landing/Marquee";
import HowItWorks from "@/components/landing/HowItWorks";
import Features from "@/components/landing/Features";
import OutputPreview from "@/components/landing/OutputPreview";
import Closing from "@/components/landing/Closing";

export default function Home() {
  return (
    <div className="grid-bg noise relative min-h-dvh">
      <Background />
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <HowItWorks />
        <Features />
        <OutputPreview />
      </main>
      <Closing />
    </div>
  );
}
