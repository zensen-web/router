module.exports = {
  env: {
    mocha: true,
    browser: true
  },
  parserOptions: {
    sourceType: 'module'
  },
  extends: ['standard'],
  plugins: ['standard', 'promise'],
  rules: {
    'new-cap': [
      'warn',
      {
        capIsNew: true
      }
    ],
    'camelcase': 0,
    'comma-dangle': ['error', 'always-multiline'],
    'eol-last': ['error', 'always'],
    'import/extensions': [
      'error',
      'always',
      {
        js: 'never'
      }
    ],
    'import/newline-after-import': ['error'],
    'no-confusing-arrow': [
      'error',
      {
        allowParens: true
      }
    ],
    'no-console': [
      'error',
      {
        allow: ['info', 'warn', 'error']
      }
    ],
    'no-implicit-coercion': ['error'],
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'all',
        caughtErrors: 'all',
        varsIgnorePattern: '_',
        argsIgnorePattern: '_',
        caughtErrorsIgnorePattern: '_',
        ignoreRestSiblings: true
      }
    ],
    'no-var': ['error'],
    'prefer-const': ['error'],
    'prefer-template': ['error'],
    'quotes': [2, 'single', { avoidEscape: true }],
    'require-await': ['error'],
    'semi': [2, 'never'],
    'space-before-function-paren': ['error', 'always'],
  }
}
