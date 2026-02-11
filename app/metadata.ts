import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://aispendaudit.com'),
  title: {
    default: 'AI Cost Explainer | Reduce OpenAI Bills by 40%',
    template: '%s | AI Cost Explainer'
  },
  description: 'Upload your OpenAI usage CSV. Get instant AI cost analysis + expert audit to cut your GPT-4, GPT-3.5 bills. Trusted by 50+ engineering teams.',
  keywords: [
    'OpenAI cost optimization', 
    'AI bill audit', 
    'reduce GPT-4 costs', 
    'OpenAI usage analyzer', 
    'AI cost savings',
    'GPT-3.5 cost optimization',
    'OpenAI API costs',
    'AI infrastructure costs'
  ],
  authors: [{ name: 'AI Cost Explainer' }],
  creator: 'AI Cost Explainer',
  publisher: 'AI Cost Explainer',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI Cost Explainer - Cut Your AI Bills by 40%',
    description: 'Instant analysis of OpenAI usage. Free breakdown + £299 expert audit with custom code fixes.',
    url: 'https://aispendaudit.com',
    siteName: 'AI Cost Explainer',
    images: [
      {
        url: 'https://aispendaudit.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'AI Cost Explainer Dashboard',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI Cost Explainer',
    description: 'Reduce OpenAI costs by 40% without changing your code',
    images: ['https://aispendaudit.com/og-image.jpg'],
    site: '@aicostexplainer',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/favicon.png",
    shortcut: "/favicon.png",
    apple: "/favicon.png",
  },
  verification: {
    google: 'YOUR_GOOGLE_SEARCH_CONSOLE_ID', // Add this when you have it
  },
  category: 'technology',
  classification: 'AI Cost Optimization',
}; 
