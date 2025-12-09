import weatherService from '../services/weatherService.js';

export const getWeather = async (req, res) => {
    try {
        const weather = await weatherService.getWeather(req.query);
        res.render('weather', { weather });
    } catch (err) {
        res.status(400).send(err.message);
    }
};
