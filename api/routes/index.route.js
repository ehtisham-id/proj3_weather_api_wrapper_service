import express from 'express';
import jwtAuth from '../middlewares/jwtAuth.middleware.js';
import apiController from '../controllers/api.controller.js';

import weatherRouter from './weather.route.js';
import authRouter from './auth.route.js';
import adminRouter from './admin.route.js';


const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Weather API Wrapper Service V1' }); 
});

apiRouter.post('/generate', jwtAuth ,apiController.generateAPIController);

apiRouter.use('/weather', weatherRouter);
apiRouter.use('/auth', authRouter);
apiRouter.use('/admin', adminRouter);


export default apiRouter;