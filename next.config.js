const path = require('path')

module.exports = {
    webpack(config, options) {
        config.resolve.alias['@'] = path.resolve(__dirname, '.')
        config.module.rules.push(
            {
                test: /\.tsx?$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['next/babel'],
                        },
                    },
                    {
                        loader: 'ts-loader',
                        options: {
                            transpileOnly: true,
                        },
                    },
                ],
            })

        return config
    },
}
