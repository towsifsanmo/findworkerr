/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/index.html',
        destination: '/',
      },
      {
        source: '/blog.html',
        destination: '/blog',
      },
      {
        source: '/profile.html',
        destination: '/profile',
      },
      {
        source: '/dashboard.html',
        destination: '/dashboard',
      },
      {
        source: '/admin.html',
        destination: '/admin',
      },
      {
        source: '/admin-login.html',
        destination: '/admin-login',
      },
    ];
  },
};

export default nextConfig;

