import { Trash2, Lock, Shield } from 'lucide-react'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Utility for tailwind class merging
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const SecuritySection = () => {
  return (
    <section className="py-20 lg:py-32 bg-[#0B1020]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Your data stays yours
          </h2>
          <p className="text-lg text-gray-400 mb-8">
            We analyze in memory. We don't store your CSV. We don't train on your data.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-8">
            {[
              { icon: Trash2, label: 'No data retention' },
              { icon: Lock, label: 'HTTPS + encrypted transfer' },
              { icon: Shield, label: 'Delete anytime' },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center gap-2 px-4 py-2 bg-gray-800/50 rounded-full"
              >
                <item.icon className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-gray-300">{item.label}</span>
              </div>
            ))}
          </div>

          <p className="text-sm text-gray-500 mono">
            Need a DPA? Email{' '}
            <a href="mailto:security@aispendaudit.com" className="text-blue-400 hover:underline">
              security@aispendaudit.com
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}