"use client"
import { Upload, Lock } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

interface FinalCTASectionProps {
  onUploadClick: () => void
}

export const FinalCTASection = ({ onUploadClick }: FinalCTASectionProps) => {
  return (
    <section className="py-20 lg:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <div 
        className="absolute inset-0 opacity-60"
        style={{ background: 'radial-gradient(circle at 50% 55%, rgba(47,132,255,0.18), rgba(0,0,0,0) 60%)' }}
      />
      
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 relative">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Upload your CSV. Get the breakdown.
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            Takes 30 seconds. No signup required for the free analysis.
          </p>
          <button
            onClick={onUploadClick}
            className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl transition-colors pulse-cta mb-6"
          >
            <Upload className="w-5 h-5" />
            Start Free Analysis
          </button>
          <p className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <Lock className="w-4 h-4" />
            Your file is processed in memory and never stored.
          </p>
        </div>
      </div>
    </section>
  )
}