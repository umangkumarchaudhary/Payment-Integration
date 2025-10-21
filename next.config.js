/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  env: {
    PHONEPE_MERCHANT_ID: process.env.PHONEPE_MERCHANT_ID,
  },
}

module.exports = nextConfig
