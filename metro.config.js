// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Support .wasm files for expo-sqlite web
config.resolver.assetExts = [...(config.resolver.assetExts || []), 'wasm'];

// Add COOP/COEP headers required for SharedArrayBuffer (expo-sqlite web)
config.server.enhanceMiddleware = (metroMiddleware, metroServer) => {
  return (req, res, next) => {
    res.setHeader('Cross-Origin-Embedder-Policy', 'credentialless');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    return metroMiddleware(req, res, next);
  };
};

module.exports = config;
