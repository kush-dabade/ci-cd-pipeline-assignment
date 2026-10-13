import { createApp } from './app';
import { config } from './config';

const app = createApp();

const server = app.listen(config.port, config.host, () => {
  console.log(`${config.appName} v${config.version} listening on http://${config.host}:${config.port}`);
});

server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

// ECS sends SIGTERM when stopping a task; finish in-flight requests before exiting.
function shutdown(signal: NodeJS.Signals): void {
  console.log(`${signal} received, shutting down gracefully`);
  server.close((err) => {
    if (err) {
      console.error('Error during shutdown:', err);
      process.exit(1);
    }
    process.exit(0);
  });
  setTimeout(() => {
    console.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
