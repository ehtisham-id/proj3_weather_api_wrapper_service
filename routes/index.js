import express from 'express';
import authRoutes from './auth.route.js';
import weatherRoutes from './weather.route.js';
import userRoutes from './user.route.js';
import adminRoutes from './admin.route.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/weather', weatherRoutes);
router.use('/user', userRoutes);
router.use('/admin', adminRoutes);

router.get('/', (req, res) => res.send('Welcome to Weather API App!'));

export default router;
