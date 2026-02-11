"use client"
import { useState, useEffect } from 'react'
import { 
  Upload, FileText, Shield, Clock, Star, CheckCircle, 
  AlertCircle, ChevronDown, Zap, Lock, Users, TrendingDown,
  ArrowRight, X, Menu, Sparkles,
  Code, Download, RefreshCw, Info, Timer, Building2,
  Trash2
} from 'lucide-react'
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

interface HeroSectionProps {
  onUploadClick: () => void
}

export const HeroSection = ({ onUploadClick }: HeroSectionProps) => {
  const [spotsLeft, setSpotsLeft] = useState(3)

  useEffect(() => {
    const interval = setInterval(() => {
      setSpotsLeft(prev => {
        if (prev > 1 && Math.random() > 0.7) return prev - 1
        return prev
      })
    }, 15000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-radial from-blue-500/10 via-transparent to-transparent opacity-60" 
           style={{ background: 'radial-gradient(circle at 50% 35%, rgba(47,132,255,0.12), rgba(0,0,0,0) 55%)' }} />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 py-12 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-7xl mx-auto">
          {/* Left Content */}
          <div className="space-y-6">
            {/* Trust Badges */}
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs font-medium">
                <Lock className="w-3.5 h-3.5" />
                Secure payment
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-full text-blue-400 text-xs font-medium">
                <Clock className="w-3.5 h-3.5" />
                48-hour delivery
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-400 text-xs font-medium">
                <Star className="w-3.5 h-3.5 fill-amber-400" />
                Rated by engineers
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white leading-tight">
              Cut your OpenAI bill by{' '}
              <span className="text-gradient">30-60%</span>
            </h1>

            {/* Subheadline */}
            <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-xl">
              Most teams overpay by 40% on AI. We find the waste. Upload your usage CSV. 
              Get an instant breakdown + an expert audit with custom fixes.
            </p>

            {/* Social Proof */}
            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-[#070A12] flex items-center justify-center text-xs font-medium text-white">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                <span className="text-white font-semibold">50+ teams</span> reducing their AI bills
              </p>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={onUploadClick}
                className="pulse-cta inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-all"
              >
                <Upload className="w-5 h-5" />
                Upload CSV — Free Analysis
              </button>
              <a
                href="#sample-report"
                className="inline-flex items-center justify-center gap-2 px-6 py-4 text-gray-400 hover:text-white font-medium transition-colors"
              >
                <FileText className="w-5 h-5" />
                See a sample report
              </a>
            </div>

            {/* Urgency Element */}
            <div className="flex items-center gap-2 text-amber-400 urgent-pulse">
              <Timer className="w-4 h-4" />
              <span className="text-sm font-medium">
                Only {spotsLeft} audit{spotsLeft !== 1 ? 's' : ''} remaining this week
              </span>
            </div>

            {/* Guarantees */}
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                £299 one-time
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                48-hour delivery
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-green-500" />
                Money-back guarantee
              </span>
            </div>
          </div>

          {/* Right Content - Before/After Visual */}
          <div className="relative">
            <div className="surface rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-400">Cost Comparison</span>
                <span className="text-xs text-gray-500 mono">Monthly AI Spend</span>
              </div>
              
              {/* Before */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Before Audit</span>
                  <span className="text-red-400 font-mono font-semibold">£4,247/mo</span>
                </div>
                <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-full w-full bg-gradient-to-r from-red-500/60 to-red-600/60 rounded-lg" />
                </div>
              </div>

              {/* Arrow */}
              <div className="flex justify-center">
                <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                  <TrendingDown className="w-4 h-4 text-green-500" />
                </div>
              </div>

              {/* After */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">After Audit</span>
                  <span className="text-green-400 font-mono font-semibold">£1,699/mo</span>
                </div>
                <div className="h-8 bg-gray-800 rounded-lg overflow-hidden">
                  <div className="h-full w-[40%] bg-gradient-to-r from-green-500/60 to-green-600/60 rounded-lg" />
                </div>
              </div>

              {/* Savings Badge */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Monthly Savings</span>
                  <span className="text-2xl font-bold text-green-400">£2,548</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">60% reduction in AI costs</p>
              </div>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-4 -left-4 surface rounded-xl p-4 shadow-xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <p className="text-lg font-bold text-white">40-60%</p>
                  <p className="text-xs text-gray-500">Typical savings</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}