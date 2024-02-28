import "./src/app/env.mjs";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  swcMinify: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // appDir: true,
    serverActions: true,
  },
  images: {
    domains: [
      "oaidalleapiprodscus.blob.core.windows.net",
      // "echoes-backet.s3.ap-southeast-2.amazonaws.com",
      "echoes-images.s3.ap-south-1.amazonaws.com",
      "d7ftvotrexusa.cloudfront.net",
      "api.projectpq.ai",
    ],
  },
  redirects: async () => {
    return [
      {
        source: "/home",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default withPWA(nextConfig);

// export default Sentry.withSentryConfig(nextConfig, {authToken: process.env.SENTRY_AUTH_TOKEN, org: process.env.SENTRY_ORG, project: process.env.SENTRY_PROJECT, hideSourceMaps: true},  {
// // For all available options, see:
// // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

// // Upload a larger set of source maps for prettier stack traces (increases build time)
// widenClientFileUpload: true,

// // Transpiles SDK to be compatible with IE11 (increases bundle size)
// transpileClientSDK: true,

// // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
// tunnelRoute: "/monitoring",

// // Hides source maps from generated client bundles
// hideSourceMaps: true,

// // Automatically tree-shake Sentry logger statements to reduce bundle size
// disableLogger: true,
// });
