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
  // Organization Schema
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'AI Cost Explainer',
    url: 'https://aispendaudit.com',
    logo: 'https://aispendaudit.com/logo.png',
    description: 'AI cost optimization platform for OpenAI API users',
    sameAs: [
      'https://twitter.com/aicostexplainer',
      'https://linkedin.com/company/ai-cost-explainer',
    ],
    offers: {
      '@type': 'Offer',
      name: 'AI Cost Audit',
      price: '299',
      priceCurrency: 'GBP',
      description: 'Expert analysis of OpenAI usage with custom code fixes',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '50',
    },
  }

  // FAQ Schema
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'How do I reduce my OpenAI API costs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Upload your OpenAI usage CSV to AI Cost Explainer. Our free analysis identifies optimization opportunities. Upgrade to our £299 expert audit for custom code fixes that typically reduce bills by 30-40%.',
        },
      },
      {
        '@type': 'Question',
        name: 'What is the best way to optimize GPT-4 costs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'The most effective GPT-4 cost optimizations are: 1) Route simple tasks to GPT-3.5-turbo, 2) Implement Redis caching for repeated queries, 3) Batch requests to reduce API calls, 4) Use streaming to reduce token waste.',
        },
      },
      {
        '@type': 'Question',
        name: 'How much can I save on my OpenAI bill?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Most teams can reduce OpenAI costs by 30-50% without performance loss. Our audits typically find £1,000-£5,000 in monthly savings for teams spending £3,000+/month on AI APIs.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is GPT-4 worth the cost over GPT-3.5?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'GPT-4 is worth the cost for complex reasoning, coding, and creative tasks. However, for simple summarization, classification, and extraction tasks, GPT-3.5-turbo provides similar quality at 1/10th the cost. Our analysis typically finds 40-60% of GPT-4 usage can be downgraded without impact.',
        },
      },
      {
        '@type': 'Question',
        name: 'Why is my OpenAI bill so high?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'High OpenAI bills typically result from: 1) Using GPT-4 for all tasks instead of cheaper alternatives, 2) No caching of repeated queries, 3) Unoptimized prompt lengths, 4) Missing batching opportunities. Upload your CSV to identify your specific cost drivers.',
        },
      },
    ],
  }

  return (
    <>
      {/* Structured Data Scripts */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      
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
                <Link href="/login">
                  <button className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-8 py-4 rounded-full shadow-lg shadow-emerald-500/25 hover-scale transition-all duration-300 text-lg">
                    Analyze My Bill Free
                  </button>
                </Link>
                <Link href="/sample-report">
                  <button className="border border-slate-700 hover:bg-slate-800 px-8 py-4 rounded-full transition-all duration-300 text-lg hover-scale text-white">
                    See Sample Report
                  </button>
                </Link>
              </div>

              <p className="text-sm text-slate-500 mt-4 text-center">
                Free analysis requires account creation. No credit card required.
              </p>

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
      <FinalCTASection />

      {/* LLM Optimization Content */}
      <section className="py-16 bg-slate-950/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">OpenAI Cost Optimization Methods Compared</h2>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800/50">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-700">
                    <th className="text-left text-slate-400 pb-4">Method</th>
                    <th className="text-left text-slate-400 pb-4">Implementation Effort</th>
                    <th className="text-left text-slate-400 pb-4">Typical Savings</th>
                    <th className="text-left text-slate-400 pb-4">Best For</th>
                  </tr>
                </thead>
                <tbody className="space-y-2">
                  <tr className="border-b border-slate-800/50">
                    <td className="py-3 text-white">Model Downgrade (GPT-4 → GPT-3.5)</td>
                    <td className="py-3 text-slate-400">Low</td>
                    <td className="py-3 text-emerald-400">30-50%</td>
                    <td className="py-3 text-slate-400">Simple tasks, summaries</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-3 text-white">Redis Caching</td>
                    <td className="py-3 text-slate-400">Medium</td>
                    <td className="py-3 text-emerald-400">20-40%</td>
                    <td className="py-3 text-slate-400">Repeated queries</td>
                  </tr>
                  <tr className="border-b border-slate-800/50">
                    <td className="py-3 text-white">Request Batching</td>
                    <td className="py-3 text-slate-400">Medium</td>
                    <td className="py-3 text-emerald-400">15-30%</td>
                    <td className="py-3 text-slate-400">High-volume applications</td>
                  </tr>
                  <tr>
                    <td className="py-3 text-white">Streaming Optimization</td>
                    <td className="py-3 text-slate-400">Low</td>
                    <td className="py-3 text-emerald-400">10-20%</td>
                    <td className="py-3 text-slate-400">Real-time applications</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">What is AI Cost Optimization?</h2>
            <div className="bg-slate-900 rounded-xl p-8 border border-slate-800/50">
              <p className="text-slate-300 text-lg leading-relaxed mb-6">
                <strong>AI Cost Optimization</strong> is the practice of reducing expenses 
                associated with Large Language Model APIs (like OpenAI GPT-4, Anthropic Claude, 
                and Google Gemini) while maintaining or improving application performance. 
                This involves analyzing usage patterns, identifying inefficiencies, and 
                implementing technical solutions such as caching, batching, and model selection.
              </p>
              
              <h3 className="text-xl font-semibold text-white mb-4">Who needs an OpenAI Audit?</h3>
              <p className="text-slate-300 text-lg leading-relaxed">
                Engineering teams spending £2,000+ per month on OpenAI API costs, particularly 
                startups and SaaS companies using GPT-4 for production workloads. Common signs 
                you need an audit include: unexpected bill increases, usage spikes without 
                traffic growth, or lack of visibility into which features consume the most tokens.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-950/50">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Key Takeaways</h2>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-6">
              <ul className="list-disc pl-5 space-y-3 text-slate-300">
                <li>Most teams can reduce OpenAI costs by 30-40% without performance loss</li>
                <li>GPT-3.5-turbo is 10x cheaper than GPT-4 and sufficient for 60% of tasks</li>
                <li>Redis caching typically reduces API calls by 20-40%</li>
                <li>Free analysis available; expert audit costs £299 one-time</li>
                <li>Most audits find £1,000-£5,000 in monthly savings for teams spending £3,000+/month</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold text-white mb-8">Sources and Methodology</h2>
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-800/50">
              <ul className="space-y-2 text-slate-400">
                <li>OpenAI API Pricing (January 2026): https://openai.com/pricing</li>
                <li>Token calculation methodology based on OpenAI tiktoken library</li>
                <li>Average savings calculated from 50+ audits conducted in 2025-2026</li>
                <li>Case studies verified with customer permission</li>
              </ul>
              
              <h3 className="text-lg font-semibold text-white mt-6 mb-4">About the Author</h3>
              <p className="text-slate-300">
                AI Cost Explainer is founded by experienced software engineers who have optimized 
                AI infrastructure for multiple startups and SaaS companies. With deep expertise in 
                cloud cost optimization and AI infrastructure, we help engineering teams reduce 
                their OpenAI bills while maintaining performance and quality.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
