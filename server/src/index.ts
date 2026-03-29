import { createApp } from './app.js';
import { loadCsv, resolveCsvPath } from './services/csvService.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function start() {
  const csvPath = resolveCsvPath();
  await loadCsv(csvPath);

  const app = createApp();

  const server = app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`);
  });

  function shutdown(signal: string) {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(() => {
      logger.info('Server closed');
      process.exit(0);
    });
  }

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

start().catch((err) => {
  logger.fatal({ err }, 'Failed to start server');
  process.exit(1);
});
