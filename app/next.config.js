/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    instrumentationHook: true,
    serverComponentsExternalPackages: ['bcrypt', 'pg', 'node-cron', 'jsonwebtoken', '@aws-sdk/client-s3'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'bcrypt', 'pg', 'node-cron', 'crypto'];
    }
    return config;
  },
};

module.exports = nextConfig;
