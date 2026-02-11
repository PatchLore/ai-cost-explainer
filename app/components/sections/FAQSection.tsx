"use client"
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const faqs = [
    {
      question: "Is my data secure?",
      answer: "Absolutely. We process your CSV entirely in memory—it's never stored on our servers. We use HTTPS encryption for all transfers, and we never train on your data. If you want extra assurance, you can delete your analysis immediately after viewing it.",
    },
    {
      question: "What if you don't find savings?",
      answer: "If our audit doesn't identify at least £100 in monthly savings, we'll refund your £299 payment in full. No questions asked. We're confident in our ability to find optimizations, but if we can't help, you don't pay.",
    },
    {
      question: "How is this different from just looking at OpenAI dashboard?",
      answer: "The OpenAI dashboard shows you what you spent, but not why or how to fix it. We analyze your usage patterns, identify specific optimization opportunities, and provide ready-to-implement code fixes. It's the difference between seeing a problem and solving it.",
    },
    {
      question: "What file do I need?",
      answer: "Just your OpenAI usage CSV. You can export it from platform.openai.com in two clicks. We support all OpenAI models including GPT-4, GPT-3.5, and embeddings.",
    },
    {
      question: "Is the free analysis really free?",
      answer: "Yes, 100% free. You get a cost breakdown by model, a 7-day trend chart, and 3 quick wins. No credit card required. Upgrade to the Expert Audit only if you want the detailed report and custom code fixes.",
    },
    {
      question: "Do you support other providers?",
      answer: "Currently we only support OpenAI usage files. We're working on adding support for Anthropic, Google, and other providers. Join our waitlist to be notified when they're available.",
    },
  ]

  return (
    <section id="faq" className="py-20 lg:py-32 bg-[#0B1020]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              FAQ
            </h2>
            <p className="text-lg text-gray-400">
              Got questions? We've got answers.
            </p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className="surface rounded-xl overflow-hidden"
              >
                <button
                  onClick={() => setOpenIndex(openIndex === index ? null : index)}
                  className="w-full flex items-center justify-between p-5 text-left"
                >
                  <span className="font-medium text-white pr-4">{faq.question}</span>
                  <ChevronDown
                    className={cn(
                      'w-5 h-5 text-gray-400 flex-shrink-0 transition-transform',
                      openIndex === index && 'rotate-180'
                    )}
                  />
                </button>
                <div
                  className={cn(
                    'accordion-content',
                    openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  )}
                >
                  <div className="px-5 pb-5 text-gray-400 leading-relaxed">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}