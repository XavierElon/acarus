import nextConfig from 'eslint-config-next'
import tsPlugin from '@typescript-eslint/eslint-plugin'

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...nextConfig,
  {
    plugins: {
      '@typescript-eslint': tsPlugin
    },
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
]

export default config
