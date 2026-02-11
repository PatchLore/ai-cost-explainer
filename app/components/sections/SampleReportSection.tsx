import { ArrowRight } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SampleReportSection = () => {
  return (
    <section id="sample-report" className="py-20 lg:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
            {/* Left Content */}
            <div className="space-y-6 lg:sticky lg:top-24">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                Sample expert report
              </h2>
              <p className="text-lg text-gray-400">
                You get a clear, actionable document—plus code you can ship.
              </p>
              <ul className="space-y-3">
                {[
                  'Executive summary',
                  'Cost breakdown + trends',
                  '3 priority fixes',
                  'Code examples (caching, batching, routing)',
                  'Implementation checklist',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="pt-4">
                <a
                  href="#pricing"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
                >
                  Get Your Audit — £299
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Right Content - Report Preview */}
            <div className="surface rounded-2xl p-1 overflow-hidden">
              <div className="bg-[#F7F8FC] rounded-xl p-6 lg:p-8 text-gray-900">
                {/* Report Header */}
                <div className="border-b border-gray-200 pb-4 mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 01-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L15.586 5H14a1 1 0 01-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-semibold text-gray-700">AI Spend Audit</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Audit: ExampleCorp — August 2026
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">Prepared by AI Spend Audit Team</p>
                </div>

                {/* Executive Summary */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Executive Summary</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Our analysis identified <strong className="text-green-600">£1,139/month</strong> in potential savings 
                    (40% of current spend). The primary opportunity is optimizing model selection, with secondary 
                    gains from implementing caching and batching strategies.
                  </p>
                </div>

                {/* Key Finding */}
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <div>
                      <p className="font-semibold text-amber-900 text-sm">Top Finding</p>
                      <p className="text-amber-800 text-sm mt-1">
                        34% of spend is on gpt-4o for tasks that work reliably with gpt-4o-mini.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Code Example */}
                <div className="mb-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-3">Recommended Fix</h4>
                  <p className="text-gray-600 text-sm mb-3">
                    Add a lightweight router to choose the smaller model when confidence is high.
                  </p>
                  <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                    <pre className="text-xs text-gray-300">
                      <code>{`// Smart model router
const routeRequest = (prompt, complexity) => {
  if (complexity < 0.7) {
    return 'gpt-4o-mini'; // 1/10th the cost
  }
  return 'gpt-4o';
};

// Estimated savings: £387/month`}</code>
                    </pre>
                  </div>
                </div>

                {/* Savings Summary */}
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-green-800 font-medium">Estimated Monthly Savings</span>
                    <span className="text-2xl font-bold text-green-600">£1,139</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}