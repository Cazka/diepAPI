const path = require('path');

module.exports = {
    mode: 'production',
    entry: './src/index.mjs',
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
            },
        ],
    },
    resolve: {
        extensions: ['.ts', '.mjs', '.js'],
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'diepAPI.js',
        library: 'diepAPI',
    },
    optimization: {
        minimize: true,
    },
};
