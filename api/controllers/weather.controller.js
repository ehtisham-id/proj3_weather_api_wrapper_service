import weatherService from 'services/weather.service.js';

const getWeatherController = async (req, res) => {
    const { lan, lot, city, country } = req.query;
    let weatherData = null;
    try {
        if (lat && lon) {
            weatherData = await weatherService.getWeatherByLatLon(lat, lon);
        } else if (city && country) {
            weatherData = await weatherService.getWeatherByCityCountry(city, country);
        } else {
            return res.status(400).json({ message: 'Invalid query parameters' });
        }
        return res.status(200).json(weatherData);
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export default { getWeatherController };