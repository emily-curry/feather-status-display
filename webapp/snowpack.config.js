// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  extends: 'electron-snowpack/config/snowpack.js',
  mount: {},
  plugins: [
    '@snowpack/plugin-react-refresh',
    [
      'snowpack-plugin-copy',
      {
        patterns: [
          {
            source: 'public/favicon.ico',
            destination: 'dist/main',
          },
          {
            source: 'public/icon*.png',
            destination: 'dist/main',
          },
        ],
      },
    ],
  ],
  packageOptions: {
    /* ... */
  },
  devOptions: {
    /* ... */
  },
  buildOptions: {
    /* ... */
  },
};
