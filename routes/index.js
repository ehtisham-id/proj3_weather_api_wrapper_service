import express from 'express';
const router = express.Router();

//Controllers
import weatherController from '../controllers/weather.controller.js';
import adminController from '../controllers/admin.controller.js';
import authController from '../controllers/auth.controller.js';
import dashboardController from '../controllers/dashboard.controller.js';

//Middlewares
import validate from '../middlewares/validation.middleware.js';
import authMiddleware from '../middlewares/auth.middleware.js';

//Validation Schemas
import { registerSchema, loginSchema, weatherQuery } from '../utils/validator.util.js';



//Auth Routes
router.get('/login', (req, res) => res.render('login'));
router.get('/signup', (req, res) => res.render('signup'));

router.post('/register', validate(registerSchema), authController.register);
router.post('/login', validate(loginSchema), authController.login);


//Weather Routes
router.get('/', weatherController.showWeatherPage);
router.post('/fetch', validate(weatherQuery), weatherController.getWeather);

//Dashboard Routes
router.get('/', authMiddleware, dashboardController.showDashboard);
router.post('/generate-key', authMiddleware, dashboardController.generateApiKey);

//Admin Routes
router.get('/', authMiddleware, adminController.showAdminPanel);

module.exports = router;
