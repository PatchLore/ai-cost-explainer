import { Suspense } from "react"
import PricingContent from "./PricingContent"

// Server Component (no "use client")
export default function PricingPage() {
  return (
    <Suspense fallback={<PricingSkeleton />}>
      <PricingContent />
    </Suspense>
  )
}

// Simple loading skeleton
function PricingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-950 pt-24 px-4">
      <div className="max-w-4xl mx-auto animate-pulse">
        <div className="h-10 bg-slate-800 rounded w-1/3 mb-8"></div>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="h-64 bg-slate-800 rounded"></div>
          <div className="h-64 bg-slate-800 rounded"></div>
        </div>
      </div>
    </div>
  )
}
