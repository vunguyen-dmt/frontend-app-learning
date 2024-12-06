const path = require('path');
const { createConfig } = require('@openedx/frontend-build');

const config = createConfig('webpack-dev');
const PUBLIC_PATH = process.env.PUBLIC_PATH || '/';

config.resolve.alias = {
  ...config.resolve.alias,
  '@src': path.resolve(__dirname, 'src'),
};

config.devServer = {
  server: 'https',
  host: process.env.HOST || '0.0.0.0',
  port: process.env.PORT || 8080,
  historyApiFallback: {
    index: path.join(PUBLIC_PATH, 'index.html'),
    disableDotRule: true,
  },
  // Enable hot reloading server. It will provide WDS_SOCKET_PATH endpoint
  // for the WebpackDevServer client so it can learn when the files were
  // updated. The WebpackDevServer client is included as an entry point
  // in the webpack development configuration. Note that only changes
  // to CSS are currently hot reloaded. JS changes will refresh the browser.
  hot: true,
  webSocketServer: 'ws',
  devMiddleware: {
    publicPath: PUBLIC_PATH,
  },
},

module.exports = config;
