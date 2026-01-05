import love from 'eslint-config-love'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import oxlint from 'eslint-plugin-oxlint'

export default [
  {
    ignores: ['node_modules/', 'dist/', 'src-tauri/', '*.config.*', 'src/**/*.gen.ts'],
  },
  {
    ...love,
    files: ['src/**/*.{ts,tsx}'],
    languageOptions: {
      ...love.languageOptions,
      parserOptions: {
        ...love.languageOptions?.parserOptions,
        projectService: true,
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    settings: {
      react: {
        version: 'detect',
      },
    },
    plugins: {
      ...love.plugins,
      react,
      'react-hooks': reactHooks,
    },
    rules: {
      ...love.rules,
      ...react.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/strict-boolean-expressions': 'warn',
      '@typescript-eslint/no-misused-promises': [
        'error',
        {
          checksVoidReturn: {
            attributes: false,
          },
        },
      ],
    },
  },
  ...oxlint.configs['flat/recommended'],
]
