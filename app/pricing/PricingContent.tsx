"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"

export default function PricingContent() {
  const [hasFreeUpload, setHasFreeUpload] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const searchParams = useSearchParams()
  
  const reason = searchParams?.get("reason")
  const uploadId = searchParams?.get("uploadId")

  useEffect(() => {
    // Check free status only on client
    async function checkStatus() {
      try {
        const res = await fetch("/api/user/check-free-status")
        const data = await res.json()
        setHasFreeUpload(data.hasFreeUpload)
      } catch (err) {
        console.error("Failed to check free status")
      }
    }
    checkStatus()
  }, [])

  const handleCheckout = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/stripe/create-concierge-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(uploadId ? { uploadId } : {}),
      })
      
      const data = await res.json()
      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error("Checkout failed")
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 pt-24 pb-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Simple Pricing
          </h1>
          
          {reason === "free-limit-reached" && (
            <div className="mt-6 inline-flex items-center gap-2 bg-amber-900/30 border border-amber-500/50 text-amber-400 px-4 py-2 rounded-full text-sm">
              You've reached your free analysis limit
            </div>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Tier */}
          <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-lg">
            <h2 className="text-2xl text-slate-300">Free Analysis</h2>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white">£0</span>
            </div>
            <ul className="mt-6 space-y-3 text-slate-400">
              <li className="flex items-center gap-2">✓ 1 analysis per account</li>
              <li className="flex items-center gap-2">✓ Basic cost breakdown</li>
              <li className="flex items-center gap-2">✓ Total spend overview</li>
              <li className="flex items-center gap-2 text-slate-600">✗ Detailed recommendations</li>
            </ul>
            
            {hasFreeUpload ? (
              <button disabled className="mt-6 w-full bg-slate-800 text-slate-500 py-3 rounded-lg cursor-not-allowed">
                Already Used
              </button>
            ) : (
              <Link href="/dashboard">
                <button className="mt-6 w-full bg-slate-700 hover:bg-slate-600 text-white py-3 rounded-lg">
                  Start Free
                </button>
              </Link>
            )}
          </div>

          {/* Expert Audit */}
          <div className="p-6 bg-emerald-900/20 border border-emerald-500/30 rounded-lg relative">
            <div className="absolute top-0 right-0 bg-emerald-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-bl-lg">
              POPULAR
            </div>
            
            <h2 className="text-2xl text-white">Expert Audit</h2>
            <div className="mt-4">
              <span className="text-4xl font-bold text-white">£299</span>
              <span className="text-slate-400"> one-time</span>
            </div>
            
            <ul className="mt-6 space-y-3 text-slate-300">
              <li className="flex items-center gap-2">✓ Unlimited re-analyses</li>
              <li className="flex items-center gap-2">✓ Detailed recommendations</li>
              <li className="flex items-center gap-2">✓ Thinking token detection</li>
              <li className="flex items-center gap-2">✓ Custom code fixes</li>
              <li className="flex items-center gap-2">✓ 48-hour delivery</li>
            </ul>
            
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              className="mt-6 w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold py-3 rounded-lg"
            >
              {isLoading ? "Redirecting..." : "Get Expert Audit"}
            </button>
          </div>
        </div>

        {/* Back link */}
        <div className="mt-12 text-center">
          <Link href="/" className="text-slate-500 hover:text-white">
            ← Back to homepage
          </Link>
        </div>
      </div>
    </div>
  )
}