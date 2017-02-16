// `CheckerPlugin` is optional. Use it if you want async error reporting.
// We need this plugin to detect a `--watch` mode. It may be removed later
// after https://github.com/webpack/webpack/issues/3460 will be resolved.
const {
    CheckerPlugin
} = require('awesome-typescript-loader')

module.exports = {

    entry: "./src/index.ts",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },

    // Currently we need to add '.ts' to the resolve.extensions array.
    resolve: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
    },

    // Source maps support ('inline-source-map' also works)
    devtool: 'source-map',

    // Add the loader for .ts files.
    module: {
        loaders: [{
            test: /\.tsx?$/,
            loader: 'awesome-typescript-loader'
        }]
    },
    target: 'node',
    devServer: {
        inline: true,
        port: 8008
    },
    plugins: [
        new CheckerPlugin()
    ]
};
