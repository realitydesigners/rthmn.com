/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        port: '',
        hostname: 'cdn.sanity.io',
        pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/**`,
        search: ''
      },
      {
        protocol: 'https',
        port: '',
        hostname: 'mcyjrazlwwmqjyhwzhcm.supabase.co',
        pathname: '/storage/v1/object/public/**',
        search: ''
      },
      {
        protocol: 'https',
        port: '',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/a/**',
        search: ''
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
