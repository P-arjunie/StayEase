const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ignore platform-specific native modules that don't exist on Windows
config.resolver.blacklistRE = /.+\/lightningcss-darwin.*/;

module.exports = config;
