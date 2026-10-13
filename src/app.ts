import express, { type ErrorRequestHandler, type Express } from 'express';
import { config } from './config';

export function createApp(): Express {
  const app = express();

  app.disable('x-powered-by');
  app.use(express.json());

  app.get('/', (_req, res) => {
    res.json({
      name: config.appName,
      version: config.version,
      message: 'Welcome to the CI/CD pipeline demo API',
    });
  });

  app.get('/health', (_req, res) => {
    res.status(200).json({
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.get('/api/info', (_req, res) => {
    res.json({
      name: config.appName,
      version: config.version,
      description: config.description,
      environment: config.environment,
      nodeVersion: process.version,
    });
  });

  app.use((req, res) => {
    res.status(404).json({ error: 'Not Found', path: req.originalUrl });
  });

  const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
    const status =
      typeof err?.status === 'number' && err.status >= 400 && err.status < 600 ? err.status : 500;
    if (status >= 500) console.error(err);
    // Never leak internal error details for server errors.
    const message = status < 500 && err?.expose ? err.message : 'Internal Server Error';
    res.status(status).json({ error: message });
  };
  app.use(errorHandler);

  return app;
}
