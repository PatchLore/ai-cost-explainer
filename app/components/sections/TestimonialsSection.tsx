import { Star } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "We cut our monthly AI spend by 41% without touching the product. The report paid for itself in the first week.",
      name: "Sarah Chen",
      role: "CTO, WorkflowTools",
      savings: "£1,240/mo saved",
    },
    {
      quote: "The report paid for itself in 4 days. I was skeptical at first, but the code fixes they provided were spot on.",
      name: "James Park",
      role: "Engineering Lead, ScaleUp",
      savings: "£890/mo saved",
    },
    {
      quote: "Finally, a tool that explains AI costs in plain English. No more guessing why our bill keeps climbing.",
      name: "Ava Thompson",
      role: "Founder, TextStack",
      savings: "£2,100/mo saved",
    },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              What teams say
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Real results from real customers.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.name}
                className="surface rounded-2xl p-6 lg:p-8 card-hover"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map(i => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-gray-300 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center text-white font-semibold">
                      {testimonial.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-white font-medium text-sm">{testimonial.name}</p>
                      <p className="text-gray-500 text-xs">{testimonial.role}</p>
                    </div>
                  </div>
                  <span className="text-xs text-green-400 font-medium bg-green-500/10 px-2 py-1 rounded">
                    {testimonial.savings}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}