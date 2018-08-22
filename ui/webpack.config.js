var path = require("path");
require('dotenv').config({
  // use main .env for now, but we can move to a separate .env
  path: path.resolve('../.env'),
});
var webpack = require("webpack");
var HtmlWebpackPlugin = require("html-webpack-plugin");
var BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

var target = "http://localhost:3000"; /// Local Node + Express

module.exports = {
    mode: 'development',
    entry: {
        vendor: [
            "@material-ui/core",
            "@material-ui/icons",
            "@material-ui/lab",
            "axios",
            "classnames",
            "lazy-route",
            "mobx",
            "mobx-react",
            "mobx-react-devtools",
            "moment",
            "numeral",
            "ramda",
            "react",
            "react-dom",
            "react-router-dom"
        ],
        app: [
            "react-hot-loader/patch",
            "webpack-dev-server/client?http://0.0.0.0:3005",
            "webpack/hot/only-dev-server",
            "babel-polyfill",
            "whatwg-fetch",
            "./src/index"
        ]
    },
    devServer: {
        hot: true,
        contentBase: path.resolve(__dirname, "dist"),
        port: 3005,
        host: "0.0.0.0",
        publicPath: "/",
        historyApiFallback: true,
        disableHostCheck: true,
        proxy: {
            "/api": { target },
        }
    },
    output: {
        path: path.join(__dirname, "dist"),
        publicPath: "/",
        filename: "[name].[hash].js",
        chunkFilename: "[name].[chunkhash].js"

    },
    devtool: "cheap-module-source-map",
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                loader: "babel-loader",
                options: {
                    presets: [
                        ["es2015", {"modules": false}],
                        "stage-0",
                        "react"
                    ],
                    plugins: [
                        "transform-async-to-generator",
                        "transform-decorators-legacy"
                    ]
                }
            },
            {
                test: /\.scss|css$/,
                use: [
                    "style-loader",
                    "css-loader",
                    {loader: "postcss-loader", options: { sourceMap: true }},
                    "resolve-url-loader",
                    "sass-loader?sourceMap"
                ]
            },
            {
                test: /\.(jpe?g|png|gif|svg)$/i,
                use: [
                    "file-loader?hash=sha512&digest=hex&name=[hash].[ext]",
                    {
                        loader: "image-webpack-loader",
                        query: {
                            mozjpeg: {
                                progressive: true,
                            },
                            gifsicle: {
                                interlaced: false,
                            },
                            optipng: {
                                optimizationLevel: 7,
                            },
                            pngquant: {
                                quality: '65-90',
                                speed: 4,
                            },
                        }
                    }
                ]
            },
            {
                test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "url-loader?limit=10000&mimetype=application/font-woff"
            },
            {
                test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                use: "file-loader"
            }
        ]
    },
    plugins: [
        new webpack.NamedModulesPlugin(),
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({ hash: false, template: "./index.hbs" }),
        new HtmlWebpackPlugin({ hash: false, template: "./oauth.hbs", filename: 'oauth.html', chunks: [] }),
        new webpack.ContextReplacementPlugin(/moment[\/\\]locale$/, /nb/),
        new webpack.DefinePlugin({
          'process.env': {
            NODE_ENV: JSON.stringify(process.env.NODE_ENV),
            API_URL: JSON.stringify(process.env.API_URL),
          },
        }),
    ]
};
