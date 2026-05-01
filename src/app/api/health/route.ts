import { runHealthChecks } from '@reviewraven/shared-infra';

const VERSION = process.env.npm_package_version || '0.1.0';

export async function GET() {
  const health = await runHealthChecks(VERSION);
  return Response.json(health);
}
