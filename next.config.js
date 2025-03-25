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
