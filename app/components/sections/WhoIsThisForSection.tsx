import { Building2, Users, Code } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const WhoIsThisForSection = () => {
  const audiences = [
    {
      icon: Building2,
      title: 'Startups',
      description: 'Scale without burning cash on AI. Perfect for pre-seed to Series B teams watching every penny.',
    },
    {
      icon: Users,
      title: 'Agencies',
      description: 'Manage multiple client AI budgets. Find savings across all your projects and increase margins.',
    },
    {
      icon: Code,
      title: 'Indie Hackers',
      description: 'Solo builders who need to maximize every dollar. Keep costs low while shipping fast.',
    },
  ]

  return (
    <section className="py-20 lg:py-32">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Who is this for?
            </h2>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Built for teams that want to optimize their AI spend without hiring a dedicated engineer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {audiences.map((audience) => (
              <div
                key={audience.title}
                className="surface rounded-2xl p-6 lg:p-8 card-hover text-center"
              >
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 flex items-center justify-center mx-auto mb-6">
                  <audience.icon className="w-8 h-8 text-blue-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">{audience.title}</h3>
                <p className="text-gray-400">{audience.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}