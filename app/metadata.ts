import type { Metadata } from "next";

const title = "AI Cost Explainer - Cut Your OpenAI Bill by 70%";
const description =
  "Upload your OpenAI usage CSV. Get instant cost analysis, optimization recommendations, and expert concierge review.";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title,
  description,
  openGraph: {
    title,
    description,
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1200,
        height: 630,
        alt: "AI Cost Explainer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: ["/og.jpg"],
  },
  icons: {
    icon: "/favicon.png",
  },
};