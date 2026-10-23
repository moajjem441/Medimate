const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Exclude backend server directory from Metro bundler
config.resolver.blockList = [
  /server\/.*/,
];

module.exports = withNativeWind(config, { input: './src/global.css' });
