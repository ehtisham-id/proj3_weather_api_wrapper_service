import weatherService from '../services/weather.service.js';
import pino from 'pino';

const logger = pino();

exports.showWeatherPage = async (req, res) => {
    try {
        res.render('weather', { weatherData: null });
    } catch (err) {
        logger.error(`Error rendering weather page: ${err.message}`);
        res.status(500).send('Internal Server Error');
    }
}

exports.getWeather = async (req, res) => {
    try {
        const { city, lat, lon, units } = req.validated;
        const weatherData = await weatherService.fetchWeather({ city, lat, lon, units });
        res.render('weather', { weatherData });
    } catch (error) {
        logger.error(`Error fetching weather data: ${error.message}`);
        res.status(500).send('Internal Server Error');
    }
}