import express from 'express';
import weatherRouter from 'routes/weather.router.js';
import authRouter from 'routes/auth.router.js';
import jwtAuth from 'middlewares/jwtAuth.middleware.js';
import tokenController from 'controllers/token.controller.js';

const apiRouter = express.Router();

apiRouter.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Weather API Wrapper Service V1' }); 
});

apiRouter.post('/generate', jwtAuth, tokenController.generateAPIController);

apiRouter.use('/weather', weatherRouter);
apiRouter.use('/auth', authRouter);


export default apiRouter;