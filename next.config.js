/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@reviewraven/shared-core', '@reviewraven/shared-intelligence', '@reviewraven/shared-diagnostics', '@reviewraven/shared-cost-control', '@reviewraven/shared-infra'],
}

module.exports = nextConfig
