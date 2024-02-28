/* eslint-disable */
const { createContentlayerPlugin } = require('next-contentlayer')
const isProd = process.env.NODE_ENV === 'production'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone',
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    // https://github.com/wojtekmaj/react-pdf/issues/799
    config.resolve.alias.canvas = false
    return config;
  },
  // Use the CDN in production and localhost for development.
  assetPrefix: isProd ? 'https://static.spotty.com.cn/doc-solver' : '',
};

const withContentlayer = createContentlayerPlugin({
  // Additional Contentlayer config options
});
module.exports = withContentlayer(nextConfig);
