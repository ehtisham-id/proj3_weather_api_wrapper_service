import weatherController from '../controllers/weather.controller.js';
import express from 'express';

import apiAuth from '../middlewares/apiAuth.middleware.js';

const weatherRouter = express.Router();

weatherRouter.get('/', apiAuth, weatherController.getWeatherController);

export default weatherRouter;