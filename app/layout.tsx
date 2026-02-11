"use client";

import { metadata } from "./metadata";
import "./globals.css";
import { useState } from "react";
import { Menu, X, Upload } from "lucide-react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <html lang="en">
      <body className="antialiased bg-gradient-mesh">
        {/* Navigation */}
        <nav className="stagger-fade fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">AI Cost Explainer</h1>
              <div className="hidden lg:flex items-center gap-6 text-slate-300">
                <a href="#how-it-works" className="hover:text-white transition-colors text-sm sm:text-base">How It Works</a>
                <a href="#pricing" className="hover:text-white transition-colors text-sm sm:text-base">Pricing</a>
                <a href="#dashboard" className="hover:text-white transition-colors text-sm sm:text-base">Dashboard</a>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                <a 
                  href="/login" 
                  className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                >
                  Login
                </a>
                <a 
                  href="/signup" 
                  className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold rounded-lg hover-scale transition-all text-sm sm:text-base"
                >
                  Get Started
                </a>
              </div>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors"
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div className={`lg:hidden absolute top-full left-0 right-0 bg-slate-950/95 backdrop-blur-xl border-b border-slate-800/50 transition-all duration-300 ease-in-out ${
            mobileMenuOpen 
              ? 'max-h-64 opacity-100 translate-y-0' 
              : 'max-h-0 opacity-0 -translate-y-2 overflow-hidden'
          }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-3">
              <a 
                href="#how-it-works" 
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                How It Works
              </a>
              <a 
                href="#pricing" 
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pricing
              </a>
              <a 
                href="#dashboard" 
                className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Dashboard
              </a>
              <div className="pt-2 border-t border-slate-800/50 space-y-2">
                <a 
                  href="/login" 
                  className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </a>
                <a 
                  href="/signup" 
                  className="block px-4 py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold rounded-lg transition-all text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Get Started
                </a>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content with spacing for fixed nav */}
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
