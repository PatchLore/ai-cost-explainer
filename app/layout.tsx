"use client";

import { metadata } from "./metadata";
import "./globals.css";
import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  
  useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    
    // Listen for auth changes
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });
    
    return () => listener.subscription.unsubscribe();
  }, []);

  return (
    <html lang="en">
      <body className="antialiased bg-gradient-mesh">
        {/* Navigation */}
        <nav className="stagger-fade fixed top-0 left-0 right-0 z-50 bg-slate-950/90 backdrop-blur-xl border-b border-slate-800/50 px-4 sm:px-6 lg:px-8 py-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4 sm:gap-8">
              {/* Logo - MUST use Link component */}
              <Link 
                href="/" 
                className="text-xl sm:text-2xl font-bold text-white tracking-tight"
              >
                AI Cost Explainer
              </Link>
              
              {/* Desktop Nav */}
              <div className="hidden lg:flex items-center gap-8">
                <Link href="/#how-it-works" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base">
                  How It Works
                </Link>
                <Link href="/#pricing" className="text-slate-400 hover:text-white transition-colors text-sm sm:text-base">
                  Pricing
                </Link>
                <Link 
                  href="/dashboard" 
                  className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2 rounded-full font-medium transition-colors text-sm sm:text-base"
                >
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-4">
              <div className="hidden sm:flex items-center gap-2">
                {user ? (
                  <>
                    <Link 
                      href="/dashboard" 
                      className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      Dashboard
                    </Link>
                    <button 
                      onClick={() => {
                        const supabase = createBrowserSupabaseClient();
                        supabase.auth.signOut();
                      }}
                      className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link 
                      href="/login" 
                      className="px-3 py-2 text-sm text-slate-300 hover:text-white transition-colors"
                    >
                      Login
                    </Link>
                    <Link 
                      href="/signup" 
                      className="px-4 py-2 sm:px-6 sm:py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold rounded-lg hover-scale transition-all text-sm sm:text-base"
                    >
                      Get Started
                    </Link>
                  </>
                )}
              </div>
              {/* Mobile menu button */}
              <button 
                className="lg:hidden p-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
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
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-slate-800/50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3">
                <Link href="/#how-it-works" className="block text-slate-400 hover:text-white py-3" onClick={() => setMobileMenuOpen(false)}>
                  How It Works
                </Link>
                <Link href="/#pricing" className="block text-slate-400 hover:text-white py-3" onClick={() => setMobileMenuOpen(false)}>
                  Pricing
                </Link>
                <Link href="/dashboard" className="block bg-emerald-500 text-slate-950 px-4 py-2 rounded-full font-medium text-center" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
                <div className="pt-2 border-t border-slate-800/50 space-y-2">
                  {user ? (
                    <>
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Dashboard
                      </Link>
                      <button 
                        onClick={() => {
                          const supabase = createBrowserSupabaseClient();
                          supabase.auth.signOut();
                          setMobileMenuOpen(false);
                        }}
                        className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors w-full text-left"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link 
                        href="/login" 
                        className="block px-4 py-3 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Login
                      </Link>
                      <Link 
                        href="/signup" 
                        className="block px-4 py-3 bg-gradient-to-r from-violet-500 to-violet-600 hover:from-violet-400 hover:to-violet-500 text-white font-semibold rounded-lg transition-all text-center"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}
        </nav>

        {/* Main Content with spacing for fixed nav */}
        <main className="pt-20">
          {children}
        </main>
      </body>
    </html>
  );
}
