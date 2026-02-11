"use client"
import { useState } from 'react'
import { Download, Upload, FileText } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const HowItWorksSection = () => {
  const steps = [
    {
      number: '01',
      title: 'Export',
      description: 'Download your usage CSV from OpenAI in two clicks.',
      icon: Download,
    },
    {
      number: '02',
      title: 'Upload',
      description: 'Drop it here. We analyze spend by model, time, and team.',
      icon: Upload,
    },
    {
      number: '03',
      title: 'Get an Audit',
      description: 'Receive a written report + custom code fixes in 48 hours.',
      icon: FileText,
    },
  ]

  return (
    <section id="how-it-works" className="py-20 lg:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              How it works
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Three steps to a lower AI bill—no engineering required.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {steps.map((step) => (
              <div
                key={step.number}
                className="tilt-card surface rounded-2xl p-6 lg:p-8 card-hover relative"
                onMouseMove={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const x = e.clientX - rect.left;
                  const y = e.clientY - rect.top;
                  const centerX = rect.width / 2;
                  const centerY = rect.height / 2;
                  const rotateX = (y - centerY) / 10;
                  const rotateY = (centerX - x) / 10;
                  
                  e.currentTarget.style.setProperty('--rotateX', `${rotateX}deg`);
                  e.currentTarget.style.setProperty('--rotateY', `${rotateY}deg`);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.setProperty('--rotateX', '0deg');
                  e.currentTarget.style.setProperty('--rotateY', '0deg');
                }}
              >
                <div className="flex items-center gap-4 mb-6">
                  <span className="mono text-4xl font-bold text-blue-500/30">{step.number}</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-500/30 to-transparent" />
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4">
                  <step.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}