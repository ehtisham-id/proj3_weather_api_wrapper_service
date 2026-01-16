import authController from '../controllers/auth.controller.js';
import validateRequest from '../middlewares/requestAuth.middleware.js';
import { registerValidation, loginValidation } from '../utils/validator.util.js';

import express from 'express';

const authRouter = express.Router();    

authRouter.post('/login', loginValidation,validateRequest, authController.loginController);
authRouter.post('/register', registerValidation,validateRequest, authController.registerController);

export default authRouter;