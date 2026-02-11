import { Users, TrendingDown } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const TestimonialsSection = () => {
  return (
    <section className="py-20 lg:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Join 50+ teams optimizing their AI spend
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Trusted by engineering teams looking to reduce their AI costs without compromising performance.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: TrendingDown,
                title: "Cost Optimization",
                description: "Identify and eliminate unnecessary AI spending"
              },
              {
                icon: Users,
                title: "Team Efficiency", 
                description: "Streamline AI usage across your organization"
              },
              {
                icon: TrendingDown,
                title: "Performance Insights",
                description: "Make data-driven decisions about AI investments"
              }
            ].map((item, i) => (
              <div
                key={i}
                className="surface rounded-2xl p-6 lg:p-8 card-hover"
              >
                <div className="flex items-center gap-3 mb-4">
                  <item.icon className="w-6 h-6 text-blue-400" />
                  <h3 className="text-white font-semibold">{item.title}</h3>
                </div>
                <p className="text-gray-300 leading-relaxed">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
