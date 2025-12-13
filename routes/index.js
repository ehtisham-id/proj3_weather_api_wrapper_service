import express from 'express';
import authRoutes from './auth.route.js';
import adminRoutes from './admin.route.js';
import { getLatLon, getWeather } from '../controllers/weather.controller.js';

const router = express.Router();

router.get('/', getWeather);
router.post('/', getLatLon);


router.use('/', authRoutes);
router.use('/', adminRoutes);

export default router;
