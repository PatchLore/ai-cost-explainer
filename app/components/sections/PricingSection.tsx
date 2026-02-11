"use client"
import { useState, useEffect } from 'react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const PricingSection = () => {
  const [timeLeft, setTimeLeft] = useState({ hours: 47, minutes: 32, seconds: 15 })

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 }
        if (prev.minutes > 0) return { ...prev, minutes: prev.minutes - 1, seconds: 59 }
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 }
        return prev
      })
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section id="pricing" className="py-20 lg:py-32 bg-[#0B1020]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Pricing
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Start free. Upgrade when you're ready to save.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="surface rounded-2xl p-6 lg:p-8 card-hover">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Instant Analysis</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">Free</span>
                </div>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  'Cost breakdown by model',
                  '7-day trend chart',
                  '3 quick wins',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-6 bg-gray-800 hover:bg-gray-700 text-white font-medium rounded-xl transition-colors">
                Upload CSV
              </button>
            </div>

            {/* Pro Plan */}
            <div className="surface rounded-2xl p-6 lg:p-8 border-2 border-blue-500 relative glow-blue">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="px-4 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                  Most Popular
                </span>
              </div>
              
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-white mb-2">Expert Audit</h3>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold text-white">£299</span>
                  <span className="text-gray-400">one-time</span>
                </div>
              </div>

              {/* Countdown Timer */}
              <div className="bg-blue-500/10 rounded-lg p-3 mb-6">
                <p className="text-xs text-blue-400 text-center mb-2">Limited time offer ends in:</p>
                <div className="flex justify-center gap-2">
                  {[
                    { value: timeLeft.hours, label: 'hrs' },
                    { value: timeLeft.minutes, label: 'min' },
                    { value: timeLeft.seconds, label: 'sec' },
                  ].map((item, i) => (
                    <div key={i} className="text-center">
                      <div className="w-12 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold mono">
                          {String(item.value).padStart(2, '0')}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <ul className="space-y-3 mb-8">
                {[
                  'Everything in Free',
                  'Written report (PDF)',
                  'Custom code fixes',
                  '48-hour delivery',
                  'Money-back if no savings found',
                ].map((feature, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors pulse-cta">
                Get Expert Audit
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}