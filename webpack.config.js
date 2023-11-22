const path = require('path');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

const entrypoints = {
  'layout.checkout': './src/assets/scripts/layouts/checkout.js',
  'layout.password': './src/assets/scripts/layouts/password.js',
  'layout.theme': './src/assets/scripts/layouts/theme.js',
  'template.404': './src/assets/scripts/templates/404.js',
  'template.article.alt': './src/assets/scripts/templates/article.alt.js',
  'template.article': './src/assets/scripts/templates/article.js',
  'template.blog': './src/assets/scripts/templates/blog.js',
  'template.cart': './src/assets/scripts/templates/cart.js',
  'template.collection.alt': './src/assets/scripts/templates/collection.alt.js',
  'template.collection': './src/assets/scripts/templates/collection.js',
  'template.index': './src/assets/scripts/templates/index.js',
  'template.page.alt': './src/assets/scripts/templates/page.alt.js',
  'template.page.custom-wishlist': './src/assets/scripts/templates/page.custom-wishlist.js',
  'template.page': './src/assets/scripts/templates/page.js',
  'template.product.alt': './src/assets/scripts/templates/product.alt.js',
  'template.product': './src/assets/scripts/templates/product.js',
  'template.search': './src/assets/scripts/templates/search.js',
  'template.customer.account': './src/assets/scripts/templates/customers/account.js',
  'template.customer.addresses': './src/assets/scripts/templates/customers/addresses.js',
  'template.customer.login': './src/assets/scripts/templates/customers/login.js',
  'template.customer.register': './src/assets/scripts/templates/customers/register.js',
  constants: './src/assets/scripts/constants.js',
  'lazysizes-custom': './src/assets/scripts/lazysizes-custom.js',
  wishlist: './src/assets/scripts/wishlist.js'
};

const themeFiles = {
  patterns: [
    {
      from: './src/assets/*.*',
      to: './assets/[name][ext]',
      noErrorOnMissing: true,
    },
    {
      from: './src/assets/static/*.*',
      to: './assets/[name][ext]',
      noErrorOnMissing: true,
    },
    {
      from: './src/assets/fonts/*.*',
      to: './assets/[name][ext]',
      noErrorOnMissing: true,
    },
    {
      from: './src/assets/svg/*.svg',
      to: './snippets/[name].liquid',
      noErrorOnMissing: true,
    },
    {
      from: './src/config/*.json',
      to: './config/[name][ext]',
    },
    {
      from: './src/layout/*.liquid',
      to: './layout/[name][ext]',
    },
    {
      from: './src/locales/*.json',
      to: './locales/[name][ext]',
    },
    {
      from: './src/sections/*.liquid',
      to: './sections/[name][ext]',
    },
    {
      from: './src/snippets/*.liquid',
      to: './snippets/[name][ext]',
    },
    {
      from: './src/templates/*.{liquid,json}',
      to: './templates/[name][ext]',
    },
    {
      from: './src/templates/customers/*.{liquid,json}',
      to: './templates/customers/[name][ext]',
    },
  ],
};

module.exports = {
  mode: 'none',
  entry: entrypoints,
  devtool: false,
  cache: false,
  module: {
    rules: [
      {
        test: /\.(liquid|svg)$/i,
        type: 'asset/source',
      },
      {
        test: /\.js$/i,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.scss$/i,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'sass-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new CopyPlugin(themeFiles),
    new MiniCssExtractPlugin({
      filename: 'assets/[name].css',
    }),
  ],
  output: {
    filename: 'assets/[name].js',
    chunkFilename: 'assets/[name].[contenthash].js',
    path: path.resolve(__dirname, 'dist'),
  },
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom': 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
    },
  },
  optimization: {
    minimize: false,
    splitChunks: {
      cacheGroups: {
        theme: {
          name: 'vendor.theme',
          test: /[\\/]node_modules[\\/](?!lazysizes|scroll-behavior-polyfill)/,
          chunks: (chunk) =>
            ![
              'layout.checkout',
              'layout.password',
              'template.password',
            ].includes(chunk.name),
        },
        checkout: {
          name: 'vendor.checkout',
          test: /[\\/]node_modules[\\/]/,
          chunks: (chunk) => chunk.name === 'layout.checkout',
        },
        password: {
          name: 'vendor.password',
          test: /[\\/]node_modules[\\/]/,
          chunks: (chunk) => ['layout.password', 'template.password'].includes(chunk.name),
        },
      },
    },
  },
  stats: {
    preset: 'errors-warnings',
    errorsCount: true,
    warningsCount: true,
    timings: true,
  },
  ignoreWarnings: [
    {
      message: /(entrypoint size limit|webpack performance recommendations)/,
    },
  ],
};
