const path = require('path')
const CopyWebpackPlugin = require('copy-webpack-plugin')

module.exports = {
    configureWebpack: {
        plugins: [
            new CopyWebpackPlugin([
                {
                    from: path.join(__dirname, 'node_modules'),
                    to: path.join(__dirname, 'unpackage/dist', process.env.NODE_ENV === 'development' ? 'dev' : 'build', process.env.UNI_PLATFORM, 'node_modules')
                },
                {
                    from: path.join(__dirname, 'package.json'),
                    to: path.join(__dirname, 'unpackage/dist', process.env.NODE_ENV === 'development' ? 'dev' : 'build', process.env.UNI_PLATFORM, 'package.json')
                },
                {
                    from: path.join(__dirname, 'pnpm-lock.yaml'),
                    to: path.join(__dirname, 'unpackage/dist', process.env.NODE_ENV === 'development' ? 'dev' : 'build', process.env.UNI_PLATFORM, 'pnpm-lock.yaml')
                }
            ])
        ]
    }
}