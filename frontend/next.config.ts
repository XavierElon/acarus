const nextConfig = {
  serverExternalPackages: ['@prisma/client'],
  output: 'standalone' // Enable standalone output for Docker
}

export default nextConfig
