const path = require('path')
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer({
    images: {
        domains: ['image.pollinations.ai'],
    },
    reactStrictMode: false,
    webpack(config, options) {
        config.resolve.alias['@'] = path.resolve(__dirname, '.')
        return config
    }
})
