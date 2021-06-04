// Snowpack Configuration File
// See all supported options: https://www.snowpack.dev/reference/configuration

/** @type {import("snowpack").SnowpackUserConfig } */
module.exports = {
  extends: 'electron-snowpack/config/snowpack.js',
  mount: {
    public: { url: '/', resolve: false },
  },
  plugins: ['@snowpack/plugin-react-refresh'],
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
