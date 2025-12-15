import Apps from '../app.js';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const SERVER_PORT = process.env.SERVER_PORT || 3000;

Apps.app.listen(SERVER_PORT, () => {
  logger.info(`Server is running on port ${SERVER_PORT}`);
}); 