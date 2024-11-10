/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['cdn.sanity.io', 'mcyjrazlwwmqjyhwzhcm.supabase.co'],
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
      }
    ]
  }
};

module.exports = nextConfig;
