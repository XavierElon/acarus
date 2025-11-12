import nextConfig from 'eslint-config-next'

/** @type {import('eslint').Linter.FlatConfig[]} */
const config = [
  ...nextConfig,
  {
    rules: {
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn'
    }
  }
]

export default config
