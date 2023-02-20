// The base directory that we want to use
const baseDirectory = 'src';
const CopyPlugin = require("copy-webpack-plugin");
const path = require("path");


module.exports = {
  // The current mode, defaults to production
  mode: 'development',

  // The entry points ("location to store": "location to find")
  entry: {
    'public/scripts/scripts': [`./${baseDirectory}/public/scripts/scripts`],
    // "other output points" : ["other entry point"]
  },
  // Using the ts-loader module
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },

  // Used for generating source maps (used for debugging)
  devtool: 'eval-source-map',

  // The location where bundle are stored
  output: {
    filename: '[name].js',
  },

  plugins: [
    new CopyPlugin({
      patterns: [
        { from:  path.resolve(__dirname, "src", "public", "css"), to: path.resolve(__dirname, "dist", "public", "css") },
        { from:  path.resolve(__dirname, "src", "public", "images"), to: path.resolve(__dirname, "dist", "public", "images") },
        { from:  path.resolve(__dirname, "src", "views"), to: path.resolve(__dirname, "dist", "views") },
      ],
    }),
  ],
};
