import express from 'express';
import { dashboard } from '../controllers/user.controller.js';

const router = express.Router();
router.get('/dashboard', dashboard);

export default router;
