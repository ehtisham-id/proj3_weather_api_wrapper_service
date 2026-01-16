import adminController from '../controllers/admin.controller.js';
import express from 'express';

import jwtAuth from '../middlewares/jwtAuth.middleware.js';
import adminAuth from '../middlewares/adminAuth.middleware.js';

const adminRouter = express.Router();

adminRouter.get('/', jwtAuth, adminAuth ,(req, res) => {
    res.status(200).json({ message: 'Admin Route Working' });
});

adminRouter.get('/stats', jwtAuth, adminAuth, adminController.getStatsController);

adminRouter.post('/:id/make-admin', jwtAuth, adminAuth, adminController.grantAdminController);



export default adminRouter;
