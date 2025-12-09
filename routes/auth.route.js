import express from 'express';
import { register, login } from '../controllers/auth.controller.js';

const router = express.Router();

router.get('/login', (req, res) => res.render('login'));
router.get('/signup', (req, res) => res.render('signup'));

router.post('/register', register);
router.post('/login', login);

export default router;
