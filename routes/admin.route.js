import express from 'express';
import { adminPanel } from '../controllers/user.controller.js';

const router = express.Router();
router.get('/admin', adminPanel);

export default router;
