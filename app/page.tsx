"use client"

import Link from "next/link";
import { HeroSection } from "./components/sections/HeroSection";
import { HowItWorksSection } from "./components/sections/HowItWorksSection";
import { DashboardPreviewSection } from "./components/sections/DashboardPreviewSection";
import { SampleReportSection } from "./components/sections/SampleReportSection";
import { PricingSection } from "./components/sections/PricingSection";
import { WhoIsThisForSection } from "./components/sections/WhoIsThisForSection";
import { SecuritySection } from "./components/sections/SecuritySection";
import { TestimonialsSection } from "./components/sections/TestimonialsSection";
import { FAQSection } from "./components/sections/FAQSection";
import { FinalCTASection } from "./components/sections/FinalCTASection";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <HeroSection onUploadClick={() => window.location.href = "/dashboard"} />
      <HowItWorksSection />
      <DashboardPreviewSection />
      <SampleReportSection />
      <PricingSection />
      <WhoIsThisForSection />
      <SecuritySection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection onUploadClick={() => window.location.href = "/dashboard"} />
    </main>
  );
}
