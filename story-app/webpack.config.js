const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const { InjectManifest } = require("workbox-webpack-plugin");
const WebpackPwaManifest = require("webpack-pwa-manifest");

const isProduction = process.env.NODE_ENV === "production";

module.exports = {
  entry: path.resolve(__dirname, "src/app.js"),
  output: {
    filename: isProduction ? "[name].[contenthash].js" : "[name].js",
    chunkFilename: isProduction ? "[name].[contenthash].chunk.js" : "[name].chunk.js",
    path: path.resolve(__dirname, "dist"),
    publicPath: "/",
    clean: true,
    assetModuleFilename: "assets/[hash][ext][query]",
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: [
          "style-loader",
          {
            loader: "css-loader",
            options: {
              importLoaders: 1,
              modules: {
                auto: true,
                localIdentName: "[name]__[local]--[hash:base64:5]",
              },
            },
          },
          "postcss-loader",
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|webp)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/images/[name].[hash][ext]",
        },
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: "asset/resource",
        generator: {
          filename: "assets/fonts/[name].[hash][ext]",
        },
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-env",
                {
                  useBuiltIns: "usage",
                  corejs: 3,
                },
              ],
            ],
            plugins: ["@babel/plugin-transform-runtime"],
          },
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, "public/index.html"),
      filename: "index.html",
      favicon: path.resolve(__dirname, "public/favicon.ico"),
      meta: {
        viewport: "width=device-width, initial-scale=1, shrink-to-fit=no",
        "theme-color": "#4a90e2",
      },
      minify: isProduction
        ? {
            collapseWhitespace: true,
            removeComments: true,
            removeRedundantAttributes: true,
            useShortDoctype: true,
          }
        : false,
    }),
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "public/assets",
          to: "assets",
          globOptions: {
            ignore: ["**/*.DS_Store"],
          },
          noErrorOnMissing: true,
        },
        {
          from: "public/manifest.json",
          to: "manifest.json",
          noErrorOnMissing: true,
        },
      ],
    }),
    isProduction &&
      new WebpackPwaManifest({
        name: "Story App",
        short_name: "StoryApp",
        description: "Dicoding Story Application",
        background_color: "#ffffff",
        theme_color: "#4a90e2",
        inject: true,
        fingerprints: false,
        icons: [
          {
            src: path.resolve("public/images/icon-192x192.png"),
            sizes: [96, 128, 192, 256, 384, 512],
            destination: path.join("assets", "icons"),
          },
        ],
      }),
    isProduction &&
      new InjectManifest({
        swSrc: "./public/sw.js",
        swDest: "sw.js",
        exclude: [
          /\.map$/,
          /manifest$/,
          /_redirects$/,
          /\.htaccess$/,
          /service-worker\.js$/,
          /sw\.js$/,
          /^https:\/\/story-api\.dicoding\.dev\/images/,
          /\/api\//,
        ],
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
      }),
  ].filter(Boolean),
  devServer: {
    static: {
      directory: path.join(__dirname, "dist"),
      watch: true,
    },
    compress: true,
    port: 9000,
    historyApiFallback: 
    {
      index: "/index.html",
      disableDotRule: true,
    },
    hot: true,
    open: true,
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
      progress: true,
      logging: "info",
    },
    proxy: [
      {
        context: ["/api"],
        target: "https://story-api.dicoding.dev",
        changeOrigin: true,
        pathRewrite: { "^/api": "/v1" },
        secure: false,
        ws: false,
      },
    ],
    devMiddleware: {
      publicPath: "/",
      writeToDisk: false,
    },
    setupMiddlewares: (middlewares, devServer) => {
      if (!devServer) {
        throw new Error("webpack-dev-server is not defined");
      }

      // Add custom middleware for service worker in development
      devServer.app.get("/sw.js", (req, res) => {
        res.set("Service-Worker-Allowed", "/");
        res.send('console.log("Service worker disabled in development");');
      });

      return middlewares;
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      "@components": path.resolve(__dirname, "src/components"),
      "@views": path.resolve(__dirname, "src/views"),
      "@assets": path.resolve(__dirname, "public/assets"),
    },
    extensions: [".js", ".json", ".css"],
  },
  optimization: {
    moduleIds: "deterministic",
    runtimeChunk: {
      name: "runtime",
    },
    splitChunks: {
      chunks: "all",
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: "vendors",
          chunks: "all",
          enforce: true,
        },
        styles: {
          name: "styles",
          test: /\.css$/,
          chunks: "all",
          enforce: true,
        },
      },
    },
  },
  performance: {
    hints: isProduction ? "warning" : false,
    maxAssetSize: 244 * 1024,
    maxEntrypointSize: 244 * 1024,
  },
  devtool: isProduction ? "source-map" : "eval-cheap-module-source-map",
};