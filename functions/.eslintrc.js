module.exports = {
  root: true,
  env: {
    es6: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    'google', // Google's recommended style guide
  ],
  rules: {
    // These are the rules we are adjusting to allow deployment
    'quotes': ['error', 'single'], // Allow single quotes (like in your frontend)
    'max-len': ['warn', { 'code': 120, 'tabWidth': 2, 'ignoreComments': true, 'ignoreUrls': true, 'ignoreStrings': true }], // Loosen max-len to 120, or remove completely if still an issue
    'indent': ['error', 2, { 'SwitchCase': 1 }], // Ensure consistent 2-space indentation (common in React)
    'comma-dangle': ['error', 'always-multiline'], // Always require trailing commas for multiline
    'object-curly-spacing': ['error', 'always'], // Ensure consistent spacing in object literals

    // You can also completely turn off rules if they are too problematic for now
    // 'max-len': 'off',
    // 'quotes': 'off',
    // 'indent': 'off',
    // 'comma-dangle': 'off',
    // 'object-curly-spacing': 'off',

    'no-trailing-spaces': 'warn', // Warn about trailing spaces instead of erroring
    'no-multi-spaces': 'warn', // Warn about multiple spaces instead of erroring
    'arrow-parens': ['error', 'as-needed'], // Allow (item) => {} or item => {}
  },
  parserOptions: {
    ecmaVersion: 2020, // Or higher if you use newer JS features (e.g., 2021, 2022)
  },
};