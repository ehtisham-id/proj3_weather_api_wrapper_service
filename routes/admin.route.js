import express from 'express';
import { adminPanel } from '../controllers/user.controller.js';

const router = express.Router();
router.get('/', adminPanel);

export default router;
