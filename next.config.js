const path = require('path')

module.exports = {
    reactStrictMode: true,
    webpack(config, options) {
        config.resolve.alias['@'] = path.resolve(__dirname, '.')
        return config
    }
}
