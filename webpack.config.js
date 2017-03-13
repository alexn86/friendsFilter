let webpack = require('webpack');
let HtmlPlugin = require('html-webpack-plugin');
let CleanWebpackPlugin = require('clean-webpack-plugin');
let ExtractTextPlugin = require('extract-text-webpack-plugin');
let loaders = require('./webpack.config.loaders')();

loaders.push({
    test: /\.css$/,
    loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: 'css-loader'
    })
});
loaders.push({
    test: /\.scss$/,
    loader: ExtractTextPlugin.extract({
        fallbackLoader: 'style-loader',
        loader: ['css-loader', 'sass-loader']
    })
});

module.exports = {
    entry: './src/js/index.js',
    output: {
        filename: '[hash].js',
        path: './dist',
        // publicPath: './dist/'
    },
    devtool: 'source-map',
    module: {
        loaders
    },
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            sourceMap: true,
            compress: {
                drop_debugger: false
            }
        }),
        new ExtractTextPlugin('styles.css'),
        new HtmlPlugin({
            title: 'Friends Filter - LoftSchool project 1',
            template: './src/template/index.hbs',
        }),
        new CleanWebpackPlugin(['dist'])
    ]
};
