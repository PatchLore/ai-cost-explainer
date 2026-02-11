"use client"

import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Shield, Lock, Globe } from "lucide-react";
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
    <>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background Blobs */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-10 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-20 left-1/2 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        </div>

        <div className="container mx-auto px-6 lg:px-8 py-20 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 text-center lg:text-left">
              {/* Badge with Avatars */}
              <div className="flex items-center justify-center lg:justify-start gap-4 bg-slate-900/40 backdrop-blur-md border border-slate-800/60 rounded-full px-6 py-3 shadow-lg shadow-black/30 inline-flex">
                <span className="text-sm font-medium text-slate-300">Trusted by 100+ engineering teams</span>
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Avatar key={i} className="w-8 h-8 border-2 border-slate-900">
                      <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} />
                      <AvatarFallback>{String.fromCharCode(64 + i)}</AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              </div>

              {/* Headline */}
              <h1 className="text-6xl font-bold text-white text-center lg:text-left max-w-4xl mx-auto lg:mx-0 text-gradient">
                Cut Your AI Bills by 40% Without Changing Your Code
              </h1>

              {/* Subhead */}
              <p className="text-xl text-slate-400 mt-6 max-w-2xl mx-auto lg:mx-0">
                Upload your OpenAI usage CSV. Get instant insights + a personalized audit to slash costs.
              </p>

              {/* CTA Group */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-8">
                <button
                  onClick={() => window.location.href = "/dashboard"}
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/25 hover-scale transition-all duration-300 text-lg"
                >
                  Analyze My Bill Free
                </button>
                <a
                  href="#sample-report"
                  className="border border-slate-700 hover:bg-slate-800 px-8 py-4 rounded-full transition-all duration-300 text-lg hover-scale"
                >
                  See Sample Report
                </a>
              </div>

              {/* Trust Bar */}
              <div className="flex items-center justify-center lg:justify-start gap-6 text-sm text-slate-600 mt-8">
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  SOC 2 Compliant
                </div>
                <div className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  GDPR Ready
                </div>
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  No Data Retention
                </div>
              </div>
            </div>

            {/* Right Visual */}
            <div className="flex justify-center lg:justify-end">
              <div className="relative">
                {/* Floating Card Mockup */}
                <div className="glass-strong p-8 rounded-2xl shadow-2xl shadow-black/50 border border-slate-800/80 max-w-md">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      </div>
                      <span className="text-sm text-slate-400">Dashboard Preview</span>
                    </div>
                    
                    {/* Mock Chart */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Monthly Spend</span>
                        <span className="text-emerald-400 font-bold">£1,699</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 h-2 rounded-full w-3/4"></div>
                      </div>
                    </div>

                    {/* Savings Indicator */}
                    <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                      <span className="text-sm text-emerald-400">Potential Savings</span>
                      <span className="text-lg font-bold text-emerald-400">£2,548/mo</span>
                    </div>
                  </div>
                </div>

                {/* Floating effect */}
                <div className="absolute -top-4 -right-4 w-24 h-24 bg-violet-500/20 rounded-full blur-xl"></div>
                <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Rest of the sections */}
      <HowItWorksSection />
      <DashboardPreviewSection />
      <SampleReportSection />
      <PricingSection />
      <WhoIsThisForSection />
      <SecuritySection />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection onUploadClick={() => window.location.href = "/dashboard"} />
    </>
  );
}
