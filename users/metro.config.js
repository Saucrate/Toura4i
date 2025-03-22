const { getDefaultConfig } = require('expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);

defaultConfig.resolver.assetExts.push('mp3');
defaultConfig.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

module.exports = defaultConfig; 