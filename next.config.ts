/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'media.istockphoto.com',
      'res.cloudinary.com',
      'example.com',
      // Add other domains you use for images
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'media.istockphoto.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      // Add other image hosts you use
    ],
  },
}

module.exports = nextConfig