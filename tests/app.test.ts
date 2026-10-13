import request from 'supertest';
import { describe, expect, it } from 'vitest';
import { createApp } from '../src/app';
import pkg from '../package.json';

const app = createApp();

describe('GET /', () => {
  it('returns the app name, version and the welcome message', async () => {
    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toEqual({
      name: pkg.name,
      version: pkg.version,
      message: 'Welcome to the updated CI/CD pipeline demo API',
    });
  });
});

describe('GET /health', () => {
  it('returns 200 with an ok status', async () => {
    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body.status).toBe('ok');
    expect(typeof res.body.uptime).toBe('number');
    expect(Number.isNaN(Date.parse(res.body.timestamp))).toBe(false);
  });
});

describe('GET /api/info', () => {
  it('returns application information', async () => {
    const res = await request(app).get('/api/info');

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/application\/json/);
    expect(res.body).toMatchObject({
      name: pkg.name,
      version: pkg.version,
      description: pkg.description,
      environment: expect.any(String),
      nodeVersion: process.version,
    });
  });
});

describe('unknown routes', () => {
  it('returns a JSON 404', async () => {
    const res = await request(app).get('/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Not Found', path: '/does-not-exist' });
  });

  it('does not expose the x-powered-by header', async () => {
    const res = await request(app).get('/');
    expect(res.headers['x-powered-by']).toBeUndefined();
  });
});
