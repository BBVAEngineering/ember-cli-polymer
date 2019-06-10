const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const decamelize = require('decamelize');
const importMetaUriLoaderPath = require.resolve('@open-wc/webpack/loaders/import-meta-url-loader.js');
const importBabelLoaderPath = require.resolve('babel-loader');
const babelLoaderInNodeModules = importBabelLoaderPath.split('/babel-loader')[0];

module.exports = ({ entries, litOutputFolder, litOutputFile, alias }) => ({
	entry: entries,
	mode: 'production',
	output: {
		path: path.resolve(litOutputFolder)
	},
	module: {
		rules: [
			{
				test: /\.js$/,
				loader: 'babel-loader',
				exclude: /node_modules\/(?!(@webcomponents\/shadycss|lit-css|styled-lit-element|lit-html|@polymer|@vaadin|@lit)\/).*/,
				options: {
					cacheDirectory: true
				}
			},
			{
				test: /\.js$/,
				loader: importMetaUriLoaderPath
			}
		]
	},
	resolve: {
		alias
	},
	resolveLoader: {
		modules: [babelLoaderInNodeModules, 'node_modules']

	},
	optimization: {
		splitChunks: {
			chunks(chunk) {
				chunk.name = decamelize(chunk.name, '-');
				return true;
			},
			minSize: 20000,
			maxSize: 100000,
			minChunks: 1,
			maxAsyncRequests: 5,
			maxInitialRequests: 3,
			automaticNameDelimiter: '-',
			name: true,
			cacheGroups: {
				commons: {
					minChunks: 2,
					priority: -20,
					reuseExistingChunk: true
				}
			}
		}
	},
	plugins: [
		new HtmlWebpackPlugin({
			template: path.join(litOutputFolder, litOutputFile),
			filename: litOutputFile,
			cache: false
		})
	]
});
