const path = require('path')

module.exports = {
    reactStrictMode: false,
    webpack(config, options) {
        config.resolve.alias['@'] = path.resolve(__dirname, '.')
        return config
    }
}
