/** @type {import('next').NextConfig} */
const nextConfig = {
	experimental: {
		reactCompiler: true,
		inlineCss: true,
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				port: "",
				hostname: "cdn.sanity.io",
				pathname: `/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/**`,
				search: "",
			},
			{
				protocol: "https",
				port: "",
				hostname: "mcyjrazlwwmqjyhwzhcm.supabase.co",
				pathname: "/storage/v1/object/public/**",
				search: "",
			},
			{
				protocol: "https",
				port: "",
				hostname: "lh3.googleusercontent.com",
				pathname: "/a/**",
				search: "",
			},
		],
	},
};

module.exports = nextConfig;
