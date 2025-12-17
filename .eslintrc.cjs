/* eslint-env node */
module.exports = {
  ignorePatterns: ['dist'],
  overrides: [
    {
      files: ['**/*.{js,jsx}'],
      extends: [
        'eslint:recommended',
        'plugin:react/recommended',
        'plugin:react-hooks/recommended',
        'prettier',
      ],
      env: {
        browser: true,
        es2021: true,
        node: true,
      },
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: { jsx: true },
        sourceType: 'module',
      },
      settings: {
        react: { version: 'detect' },
      },
      rules: {
        'no-unused-vars': ['warn', { varsIgnorePattern: '^[A-Z_]' }],
        'react/react-in-jsx-scope': 'off',
        'react/prop-types': 'off',
        'no-empty': 'warn',
        'react/no-unknown-property': 'warn',
      },
    },
    {
      files: ['**/__tests__/**/*.{js,jsx,ts,tsx}', '**/*.test.{js,jsx,ts,tsx}'],
      env: {
        jest: true,
        node: true,
        es2021: true,
      },
    },
  ],
};
