/** @type {import('next').NextConfig} */
const nextConfig = {
    webpack: (config, { isServer }) => {
        // Handle Remotion's special requirements
        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            crypto: false,
        };

        return config;
    },
    experimental: {
        serverActions: {
            bodySizeLimit: '100mb',
        },
    },
};

module.exports = nextConfig;
