import express from 'express';
import apiRoutes from 'routes/index.router.js';

const router = express.Router();

router.use('/v1', apiRoutes);

export default router;