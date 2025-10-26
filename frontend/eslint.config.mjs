import { type Config } from 'eslint'

const config: Config = {
  extends: ['next/core-web-vitals'],
  rules: {
    '@typescript-eslint/no-unused-vars': 'warn',
    '@typescript-eslint/no-explicit-any': 'warn'
  }
}

export default config
