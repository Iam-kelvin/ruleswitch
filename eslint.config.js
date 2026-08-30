const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  ...expoConfig,
  {
    ignores: ['dist/**', 'coverage/**', 'assets/**/*.wav', 'assets/**/*.png'],
    rules: {
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
]);
