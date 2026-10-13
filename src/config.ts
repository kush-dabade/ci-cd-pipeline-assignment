import { readFileSync } from 'node:fs';
import path from 'node:path';

interface PackageJson {
  name: string;
  version: string;
  description?: string;
}

// package.json sits one level above both src/ (dev, tests) and dist/ (production build).
function readPackageJson(): PackageJson {
  const raw = readFileSync(path.join(__dirname, '..', 'package.json'), 'utf8');
  return JSON.parse(raw) as PackageJson;
}

function parsePort(value: string | undefined): number {
  if (value === undefined || value === '') return 3000;
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT value "${value}": must be an integer between 1 and 65535`);
  }
  return port;
}

const pkg = readPackageJson();

export const config = {
  appName: pkg.name,
  version: pkg.version,
  description: pkg.description ?? '',
  environment: process.env.NODE_ENV ?? 'development',
  host: '0.0.0.0',
  port: parsePort(process.env.PORT),
};
