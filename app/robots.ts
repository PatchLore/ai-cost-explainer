import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/admin/',
          '/api/',
          '/auth/',
          '/_next/',
          '/debug/',
        ],
      },
    ],
    sitemap: 'https://aispendaudit.com/sitemap.xml',
    host: 'https://aispendaudit.com',
  }
}