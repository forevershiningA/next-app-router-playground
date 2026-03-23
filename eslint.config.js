const nextCoreWebVitals = require('eslint-config-next/core-web-vitals');
const nextTypeScript = require('eslint-config-next/typescript');

module.exports = [
  {
    ignores: [
      'legacy/**',
      'docs/**',
      'scripts/**',
      'public/**',
      '.next/**',
      'node_modules/**',
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
];
