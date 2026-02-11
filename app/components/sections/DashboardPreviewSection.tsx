"use client"
import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { 
  BarChart as ReBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, 
  ResponsiveContainer, PieChart as RePieChart, Pie, Cell, LineChart, Line,
  AreaChart, Area
} from 'recharts'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Mock data
const MOCK_ANALYSIS = {
  totalSpend: 2847.50,
  potentialSavings: 1139.00,
  savingsScore: 72,
  topModels: [
    { name: 'gpt-4o', spend: 1423.75, percentage: 50 },
    { name: 'gpt-4o-mini', spend: 854.25, percentage: 30 },
    { name: 'o1-preview', spend: 427.13, percentage: 15 },
    { name: 'text-embedding-3', spend: 142.37, percentage: 5 },
  ],
  dailyTrend: [
    { date: 'Mon', amount: 380 },
    { date: 'Tue', amount: 420 },
    { date: 'Wed', amount: 350 },
    { date: 'Thu', amount: 510 },
    { date: 'Fri', amount: 480 },
    { date: 'Sat', amount: 320 },
    { date: 'Sun', amount: 387 },
  ],
  recommendations: [
    'Switch 40% of gpt-4o calls to gpt-4o-mini for similar quality at 1/10th cost',
    'Implement response caching for repeated queries - potential 25% savings',
    'Use batch processing for non-real-time tasks - save up to 50% on API costs',
  ]
}

const COLORS = ['#2F84FF', '#27C26F', '#F59E0B', '#8B5CF6']

export const DashboardPreviewSection = () => {
  const [activeTab, setActiveTab] = useState<'models' | 'trend'>('models')

  return (
    <section className="py-20 lg:py-32 bg-[#0B1020]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
                See where the money goes
              </h2>
              <p className="text-lg text-gray-400">
                We break down spend by model, day, and team—so you know exactly what to optimize.
              </p>
              <ul className="space-y-3">
                {[
                  'Spot expensive model choices',
                  'Find usage spikes',
                  'Compare teams',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors"
              >
                Try the free analysis
                <ArrowRight className="w-4 h-4" />
              </a>
            </div>

            {/* Right Content - Dashboard Preview */}
            <div className="surface rounded-2xl p-4 lg:p-6">
              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setActiveTab('models')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === 'models'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  )}
                >
                  Cost by model
                </button>
                <button
                  onClick={() => setActiveTab('trend')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
                    activeTab === 'trend'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:text-white'
                  )}
                >
                  Daily trend
                </button>
              </div>

              {/* Chart */}
              <div className="h-64 lg:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  {activeTab === 'models' ? (
                    <ReBarChart data={MOCK_ANALYSIS.topModels}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b7280" 
                        fontSize={12}
                        tickFormatter={(value) => value.split('-')[0]}
                      />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={12}
                        tickFormatter={(value) => `£${value}`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#111727',
                          border: '1px solid rgba(151,163,191,0.22)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`£${value.toFixed(2)}`, 'Spend']}
                      />
                      <Bar dataKey="spend" radius={[4, 4, 0, 0]}>
                        {MOCK_ANALYSIS.topModels.map((_entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </ReBarChart>
                  ) : (
                    <AreaChart data={MOCK_ANALYSIS.dailyTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                      <XAxis dataKey="date" stroke="#6b7280" fontSize={12} />
                      <YAxis 
                        stroke="#6b7280" 
                        fontSize={12}
                        tickFormatter={(value) => `£${value}`}
                      />
                      <RechartsTooltip
                        contentStyle={{
                          backgroundColor: '#111727',
                          border: '1px solid rgba(151,163,191,0.22)',
                          borderRadius: '8px',
                        }}
                        formatter={(value: number) => [`£${value}`, 'Spend']}
                      />
                      <Area
                        type="monotone"
                        dataKey="amount"
                        stroke="#2F84FF"
                        fill="#2F84FF"
                        fillOpacity={0.2}
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Total Spend</p>
                  <p className="text-lg font-semibold text-white mono">£2,847</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Top Model</p>
                  <p className="text-lg font-semibold text-white">gpt-4o</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Potential Savings</p>
                  <p className="text-lg font-semibold text-green-400 mono">Significant</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}