/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  webpack(config) {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    // https://github.com/wojtekmaj/react-pdf/issues/799
    config.resolve.alias.canvas = false
    return config;
  },
};

export default nextConfig;
