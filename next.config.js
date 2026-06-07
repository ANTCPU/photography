/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'w9cysoaxfshj0nmr.public.blob.vercel-storage.com',
      },
    ],
  },
}
module.exports = nextConfig
