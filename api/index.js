import express from 'express';
import apiRoutes from './routes/index.route.js';

const router = express.Router();
router.use(express.json());

router.use('/v1', apiRoutes);

export default router;