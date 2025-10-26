import type { Config } from 'next'

const nextConfig: Config = {
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client']
  }
}

export default nextConfig
