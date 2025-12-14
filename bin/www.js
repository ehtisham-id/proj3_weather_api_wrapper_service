import Apps from '../app.js';
import pino from 'pino';

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });

const PORT = process.env.PORT || 3000;

Apps.app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
}); 

Apps.server.listen(process.env.SERVER_PORT || 5000, () => {
  logger.info(`API Server is running on port ${process.env.SERVER_PORT || 5000}`);
});


