const withBundleAnalyzer = require("@next/bundle-analyzer")({
	enabled: process.env.ANALYZE === "true",
});

const excludedLogs = process.env.VERCEL_ENV === "production";
const CompressionPlugin = require("compression-webpack-plugin");
const zlib = require("zlib");

module.exports = withBundleAnalyzer({
	compress: false,
	compiler: {
		...(excludedLogs && {
			removeConsole: {
				exclude: ["error"],
			},
		}),
	},
	i18n: {
		locales: ["en", "es", "fr", "it", "jp", "nl", "pt", "pl", "sv", "ar", "id", "de", "hi", "he", "kr", "th", "cn", "hk", "tw"],
		defaultLocale: "en",
		localeDetection: false,
	},
	trailingSlash: true,
	experimental: {
		largePageDataBytes: 254 * 1000,
		optimizePackageImports: ["swiper", "swr", "lodash", "@react-pdf/renderer", "react-pdf-html"],
	},
	images: {
		remotePatterns: [
			{
				protocol: "https",
				hostname: "**.wpengine.com",
			},
			{
				protocol: "https",
				hostname: "**.wpenginepowered.com",
			},
			{
				protocol: "http",
				hostname: "localhost",
			},
			{
				protocol: "https",
				hostname: "gp-cms.localhost",
			},
			{
				protocol: "https",
				hostname: "**.on21yb.com",
			},
			{
				protocol: "https",
				hostname: "fs.21yb.site",
			},
			{
				protocol: "https",
				hostname: "cdn.cookielaw.org",
			},
		],
		formats: ["image/avif", "image/webp"],
	},
	async headers() {
		return [
			{
				source: "/.well-known/com.apple.remotemanagement",
				headers: [
					{
						key: "Content-Type",
						value: "application/json",
					},
				],
			},
			{
				source: "/:path*",
				headers: [
					{
						key: "Content-Security-Policy",
						value: `
						
						script-src 'self' 'unsafe-eval' 'unsafe-inline'
						https://boards.greenhouse.io/
						https://job-boards.greenhouse.io/
						http://cdn-4.convertexperiments.com/
						http://js.hsforms.net
						http://cdn.leadmanagerfx.com/
						https://bootstrap.driftapi.com 
						https://js.drift.com 
						https://metrics.api.drift.com
						https://agent.marketingcloudfx.com
						https://bat.bing.com
						https://cdn.cookielaw.org
						https://cdn.debugbear.com
						https://cdn.heapanalytics.com
						https://connect.facebook.net
						https://j.6sc.co
						https://js.driftt.com
						https://unpkg.com/@rive-app/canvas
						https://cdn.jsdelivr.net/npm/@rive-app/canvas
						https://va.vercel-scripts.com
						https://www.googletagmanager.com
						https://td.doubleclick.net
						https://js.hs-scripts.com
						http://js.hs-scripts.com
						https://www.globalization-partners.com
						https://snap.licdn.com
						https://static.ads-twitter.com
						https://cdn.matomo.cloud
						https://googleads.g.doubleclick.net
						https://cdn-4.convertexperiments.com
						https://cdn.leadmanagerfx.com
						https://script.hotjar.com
						https://static.hotjar.com
						https://login-ds.dotomi.com
						https://js.hsforms.net
						https://js.hs-analytics.net
						https://js.hs-banner.com/
						https://www.google.com/
						https://www.gstatic.com/
						https://js.hubspot.com
						https://app.hubspot.com/
						https://eps.6sc.co
						https://dev.visualwebsiteoptimizer.com
						https://t.marketingcloudfx.com
						https://www.googleadservices.com
						https://prod.impartner.live
						https://packages.prmcdn.io					
						https://metrics.api.drift.com/
						https://staging.globalization-partners.com/
						https://event.api.drift.com
						https://www.onelink-edge.com
						https://pipedream.wistia.com
						https://js.sentry-cdn.com
						https://sentry.io
						https://js-agent.newrelic.com
						https://www.youtube.com
						https://fg8vvsvnieiv3ej16jby.litix.io
						https://forms-na1.hsforms.com
						https://fs.21yb.site/
						https://*.hsforms.com
						https://*.litix.io
						https://vercel.live
						https://ib.adnxs.com
						https://fast.wistia.net
						https://fast.wistia.com
						https://www.redditstatic.com
						https://t.contentsquare.net
						wss://131449-49.chat.api.drift.com
						https://driftt.imgix.net
						wss://presence.api.drift.com
						https://targeting.api.drift.com/;
						worker-src 'self' blob: https://www.globalization-partners.com;
						base-uri 'self';
						object-src 'self'
						https://gpcmsdev.wpengine.com
						https://gpcmsstag.wpengine.com
						https://gpcmsdev.wpenginepowered.com
						https://gpcmsstag.wpenginepowered.com;
						`
							.replace(/\s{2,}/g, " ")
							.trim(),
					},

					{
						key: "Cache-Control",
						value: "public, max-age=0, s-maxage=86400, must-revalidate",
					},
					{
						key: "X-Frame-Options",
						value: "DENY",
					},
					{
						key: "X-Content-Type-Options",
						value: "nosniff",
					},
					{
						key: "Referrer-Policy",
						value: "no-referrer-when-downgrade",
					},
					{
						key: "Permissions-Policy",
						value: "browsing-topics=()",
					},
				],
			},
			{
				source: "/:all*(jpg|jpeg|png|svg|gif|mp4|webm|webp|riv|pdf)",
				headers: [
					{
						key: "Cache-Control",
						value: "public, max-age=5184000, must-revalidate",
					},
				],
			},
		];
	},
	async redirects() {
		return require("./redirects.json");
	},
	async rewrites() {
		return {
			beforeFiles: [
				// {
				// 	// Regex rewrite for onelinkjs to translate
				// 	source: "/(es|fr|it|jp|nl|pt|pl|sv|ar|id|de|hi|he|kr|th|cn|hk|tw)/:path*",
				// 	destination: `/:path*`,
				// },
				{
					// Rewrite for CMS rest API
					source: "/wp-json/:path*",
					destination: `${process.env.NEXT_PUBLIC_WORDPRESS_BASE_URL}/wp-json/:path*`,
				},
				// {
				// 	source: "/(.*)",
				// 	destination: "/",
				// },
			],
			afterFiles: [
				{
					// Rewrite for keeping the blog page on the path
					source: "/blog/page/:slug",
					destination: "/blog"
				},
				{
					// Rewrite for keeping the blog page on the path
					source: "/blog/category/:category/page/:slug",
					destination: "/blog"
				},
				{
					source: "/globalpedia/page/:slug",
					destination: "/globalpedia"
				},
				{
					source: "/resources/page/:slug",
					destination: "/resources"
				},
				{
					source: "/resources/:category/page/:slug",
					destination: "/resources/:category"
				},
				{
					source: "/case-studies/page/:slug",
					destination: "/case-studies"
				},
				{
					source: "/events/page/:slug",
					destination: "/events"
				},
				{
					source: "/podcasts/page/:slug",
					destination: "/podcasts"
				},
				{
					source: "/search/page/:slug",
					destination: "/search"
				},
			]
		};
	},
	webpack(config) {
		config.plugins.push(
			new CompressionPlugin({
				filename: "[path][base].br",
				algorithm: "brotliCompress",
				test: /\.(js|css|html|svg)$/,
				compressionOptions: {
					params: {
						[zlib.constants.BROTLI_PARAM_QUALITY]: 11,
					},
				},
				threshold: 10240, // Only compress files > 10kb
				minRatio: 0.8, // Only compress if compression ratio is better than 0.8
				deleteOriginalAssets: false, // Keep original files
			})
		);

		config.module.rules.push({
			test: /\.svg$/,
			use: ["@svgr/webpack"],
		});
		return config;
	},
});
