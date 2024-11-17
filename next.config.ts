/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cdn.sanity.io',
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/**`
      },
      {
        protocol: 'https',
        hostname: 'mcyjrazlwwmqjyhwzhcm.supabase.co',
        pathname: '/storage/v1/object/public/**'
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**'
      }
    ]
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'zlib-sync': false,
        bufferutil: false,
        'utf-8-validate': false
      };
    }
    return config;
  },
  serverExternalPackages: [
    'discord.js',
    'zlib-sync',
    'bufferutil',
    'utf-8-validate'
  ]
};

module.exports = nextConfig;
