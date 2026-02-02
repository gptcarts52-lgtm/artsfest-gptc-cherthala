/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  // Provide a fallback string so Next.js validation won't warn when
  // `process.env.CUSTOM_KEY` is not set during dev/build.
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY ?? '',
  },
}

module.exports = nextConfig