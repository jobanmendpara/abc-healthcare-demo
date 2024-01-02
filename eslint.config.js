import antfu from '@antfu/eslint-config';
import {
  FlatCompat,
} from '@eslint/eslintrc';

const compat = new FlatCompat();

export default antfu(
  {
    ignores: [
      '*.json',
      'presets',
      'package.json',
      'nuxt.config.ts',
      'README.md',
    ],
    stylistic: {
      semi: true,
      indent: 2,
      quotes: 'single',
    },
  },
  ...compat.config({
    env: {
      browser: true,
      es2021: true,
      node: true,
    },
    parser: 'vue-eslint-parser',
    parserOptions: {
      ecmaVersion: 'latest',
      extraFileExtensions: ['.vue'],
      parser: '@typescript-eslint/parser',
      sourceType: 'module',
    },
    plugins: [
      '@typescript-eslint',
    ],
    extends: [
      'plugin:nuxt/recommended',
      'plugin:@typescript-eslint/recommended',
      'plugin:vue/vue3-recommended',
    ],
    rules: {
      '@typescript-eslint/consistent-type-imports': 'warn',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'node/prefer-global/process': 'off',
      'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
      'unused-imports/no-unused-vars': 'off',
      'vue/multi-word-component-names': 'off',
    },
    overrides: [
      {
        files: ['*.vue'], // Targeting Vue files
        rules: {
          '@typescript-eslint/no-unused-vars': 'off', // Turn off the rule for Vue files
        },
      },
    ],
  }),
);
