/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Allow remote images used in the hero / why-us sections (Pexels + Unsplash).
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  // Loosen the rule that warns when we use a plain <img> for the hero parallax layer.
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
