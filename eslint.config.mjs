import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { includeIgnoreFile } from '@eslint/compat'
import js from '@eslint/js'
import nextPlugin from '@next/eslint-plugin-next'
import eslintConfigPrettier from 'eslint-config-prettier'
import importPlugin from 'eslint-plugin-import'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import unicorn from 'eslint-plugin-unicorn'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default tseslint.config(
  // ── 1. Global ignores ──────────────────────────────────────────────
  includeIgnoreFile(path.resolve(__dirname, '.gitignore')),
  { ignores: ['content/**', '.source/**'] },

  // ── 2. Base configs ────────────────────────────────────────────────
  js.configs.recommended,
  ...tseslint.configs.recommended,

  // ── 3. All JS / TS files — shared rules ────────────────────────────
  {
    files: ['**/*.{js,jsx,cjs,mjs,ts,tsx,cts,mts}'],
    plugins: {
      import: importPlugin,
      unicorn,
    },
    rules: {
      'prefer-object-has-own': 'error',
      'logical-assignment-operators': ['error', 'always', { enforceForIfStatements: true }],
      'no-else-return': ['error', { allowElseIf: false }],
      'no-lonely-if': 'error',
      'prefer-destructuring': ['error', { VariableDeclarator: { object: true } }],
      'import/no-duplicates': 'error',
      'no-negated-condition': 'off',
      'unicorn/no-negated-condition': 'error',
      'prefer-regex-literals': ['error', { disallowRedundantWrapping: true }],
      'object-shorthand': ['error', 'always'],
      'unicorn/prefer-regexp-test': 'error',
      'unicorn/no-array-for-each': 'error',
      'unicorn/prefer-string-replace-all': 'error',
      '@typescript-eslint/prefer-for-of': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', destructuredArrayIgnorePattern: '^_' },
      ],
      // todo: enable
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
    },
  },

  // ── 4. React files ─────────────────────────────────────────────────
  {
    files: ['app/**/*.{tsx,jsx}', 'components/**/*.{tsx,jsx}', 'lib/**/*.{tsx,jsx}'],
    ...react.configs.flat.recommended,
    ...react.configs.flat['jsx-runtime'],
    plugins: {
      ...react.configs.flat.recommended.plugins,
      'react-hooks': reactHooks,
    },
    settings: { react: { version: 'detect' } },
    rules: {
      ...react.configs.flat.recommended.rules,
      ...react.configs.flat['jsx-runtime'].rules,
      ...reactHooks.configs['recommended-latest'].rules,
      'react/prop-types': 'off',
      'react/no-unknown-property': ['error', { ignore: ['jsx'] }],
      'react-hooks/exhaustive-deps': 'error',
      'react/self-closing-comp': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            'CallExpression[callee.name=useMemo][arguments.1.type=ArrayExpression][arguments.1.elements.length=0]',
          message:
            "`useMemo` with an empty dependency array can't provide a stable reference, use `useRef` instead.",
        },
        {
          selector: 'MemberExpression[object.name=z] > .property[name=object]',
          message: 'Use z.strictObject is more safe.',
        },
      ],
      'react/jsx-filename-extension': [
        'error',
        { extensions: ['.tsx', '.jsx'], allow: 'as-needed' },
      ],
      'react/jsx-curly-brace-presence': 'error',
      'react/jsx-boolean-value': 'error',
    },
  },

  // ── 5. Next.js rules ───────────────────────────────────────────────
  {
    files: ['app/**/*.{tsx,jsx}', 'components/**/*.{tsx,jsx}', 'lib/**/*.{tsx,jsx}'],
    plugins: { '@next/next': nextPlugin },
    rules: {
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,
    },
  },

  // ── 6. TypeScript type-checked ─────────────────────────────────────
  {
    files: ['**/*.{ts,tsx,cts,mts}'],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/non-nullable-type-assertion-style': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
    },
  },

  // ── 7. Tailwind CSS ────────────────────────────────────────────────
  // eslint-plugin-tailwindcss is v3-only (it imports tailwindcss/resolveConfig,
  // removed in Tailwind v4) and has no stable v4 release, so its lint rules are
  // dropped with the Tailwind v4 upgrade. Class ordering is handled by
  // prettier-plugin-tailwindcss if/when added.

  // ── 8. Node / CJS config files ─────────────────────────────────────
  {
    files: [
      '*.config.{js,cjs,mjs,ts}',
      'postcss.config.*',
      'prettier.config.*',
      '.prettierrc.{js,cjs}',
      '**/*.cjs',
      'scripts/**/*.{js,mjs}',
    ],
    languageOptions: {
      globals: globals.node,
    },
  },

  // ── 9. E2E / test files ────────────────────────────────────────────
  {
    files: ['e2e/**/*.{ts,js}'],
    languageOptions: {
      globals: globals.node,
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },

  // ── 10. Declaration files ──────────────────────────────────────────
  {
    files: ['**/*.d.ts'],
    rules: { 'no-var': 'off' },
  },

  // ── 11. Prettier (must be last) ────────────────────────────────────
  eslintConfigPrettier,
)
