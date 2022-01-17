const fs = require('fs'),
    webpack = require('webpack'),
    path = require('path'),
    entrypointPath = path.resolve(__dirname, 'index.js');

module.exports = (env, argv) => {
    return {
        entry: {
            script: './index.js'
        },
        module: {
            rules: [{
                test: /\.js$/,
                exclude: /node_modules/,
                use: [{
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env'],
                        plugins: [
                            '@babel/plugin-proposal-private-methods',
                            '@babel/plugin-proposal-class-properties',
                        ]
                    }
                }]
            }]
        },
        resolve: {
            extensions: ['*', '.js']
        },
        output: {
            filename: 'index.js'
        },
        devServer: {
            port: 3000,
            publicPath: '/build'
        }
    };
};
