//@ts-check
const { composePlugins, withNx } = require('@nx/next');

const nextConfig = {
    nx: { svgr: false },
    async redirects() {
        return [
            { source: '/', destination: '/auth/login', permanent: true }
        ]
    },
    webpack(config) {
        config.module.rules.push({ test: /\.svg$/, use: ['@svgr/webpack'] });
        return config;
    }
};

const plugins = [withNx];
module.exports = composePlugins(...plugins)(nextConfig);
