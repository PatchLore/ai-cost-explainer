const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true
  },
  experimental: {
    instrumentationHook: true,
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.ignoreWarnings = [
        { module: /node_modules\/@opentelemetry\/instrumentation/ },
        { module: /node_modules\/require-in-the-middle/ },
        { module: /node_modules\/@prisma\/instrumentation/ }
      ]
    }
    return config
  }
};

const sentryWebpackPluginOptions = {
  org: process.env.SENTRY_ORG || undefined,
  project: process.env.SENTRY_PROJECT || undefined,
  authToken: process.env.SENTRY_AUTH_TOKEN || undefined,
  silent: !process.env.CI,
};

// Only enable Sentry plugin when required env vars are fully configured
const hasSentryConfig =
  process.env.SENTRY_AUTH_TOKEN &&
  process.env.SENTRY_ORG &&
  process.env.SENTRY_PROJECT &&
  process.env.SENTRY_DSN;

// Temporarily disable Sentry build integrations to avoid build failures
// Enable withSentryConfig only when Sentry is fully configured and tested.
module.exports = nextConfig;
