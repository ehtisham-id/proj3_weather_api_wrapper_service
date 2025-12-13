import weatherService from '../services/weather.service.js';
import pino from 'pino';

const logger = pino();

export const getWeather = async (req, res) => {
    try {
        const weather = await weatherService.getWeather(req.query);
        res.render('index', { weather });
    } catch (err) {
        res.status(400).send(err.message);
    }
};

export const getLatLon = async (req, res) => {
    const { city, country, units } = req.body;
    logger.info(`City: ${city}, Country: ${country}, Units: ${units}`);
    try { 
        const { latitude, longitude } = await weatherService.getLatLon({ city, country });
        const weather = await weatherService.getWeather({ latitude, longitude, units });
        res.render('index', { weather });
    }catch (err) {
        res.status(400).send(err.message);
    }
}
