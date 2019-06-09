const path = require('path');
const glob = require('glob');
const onceImporter = require('node-sass-once-importer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');

function globs(entries) {
    let result = [];
    for (let i = 0; i < entries.length; i++) {
        const pattern = entries[i];
        result = result.concat(glob.sync(pattern));
    }
    return result;
}

module.exports = {
    context: __dirname,
    mode: 'development',
    devtool: "source-map",
    entry: {
        'main.css': ['./styles/main.scss'],
        'asset.js': globs([
            './scripts/*.js'
        ])
    },
    output: {
        path: path.resolve(__dirname, './assets'),
        filename: '[name]'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                include: /\.scss$/,
                use: ExtractTextPlugin.extract({
                    fallback: 'style-loader',
                    use: [
                        {
                            loader: 'css-loader',
                        },
                        {
                            loader: 'resolve-url-loader'
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                importer: onceImporter(),
                                sourceMap: true, // required by resolve-url-loader
                                sourceMapContents: false
                            }
                        }
                    ]
                })
            },
            {
                // Webpack не понимает @font-face в css без этого.
                test: /\.(png|jpg|jpeg|woff(2)?|eot|ttf|svg)$/,
                use: ['url-loader']
            },
            {
                test: /\.(ts|tsx)$/,
                use: ['babel-loader', 'ts-loader']
            },
            {
                test: /\.(js|jsx)$/,
                use: ['babel-loader']
            }
        ]
    },
    plugins: [
        new ExtractTextPlugin('[name]')
    ],
    resolve: {
        extensions: ['*', '.ts', '.tsx', '.js', '.jsx']
    }
}