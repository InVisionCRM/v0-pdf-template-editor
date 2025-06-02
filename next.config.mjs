/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    domains: ['ehjgnin9yr7pmzsk.public.blob.vercel-storage.com'],
    unoptimized: true,
  },
};

export default nextConfig;
