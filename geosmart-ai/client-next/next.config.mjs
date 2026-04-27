/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // next-pwa removed for Render.com compatibility (build-time dev dep issue)
  // PWA can be re-added after confirming build succeeds
  output: 'standalone',
};

export default nextConfig;
