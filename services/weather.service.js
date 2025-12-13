import axios from 'axios';
import pino from 'pino';

const logger = pino();

const getWeather = async (query) => {
    try {
        const latitude = query.latitude || process.env.DEFAULT_LATITUDE;
        const longitude = query.longitude || process.env.DEFAULT_LONGITUDE;

        const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&hourly=temperature_2m`;
        const response = await axios.get(url);

        // Basic parsing
        const data = response.data;
        const hourly = data.hourly?.temperature_2m || [];

        return {
            latitude: data.latitude,
            longitude: data.longitude,
            hourly
        };
    } catch (err) {
        throw new Error('Unable to fetch weather data.');
    }
};

const getLatLon = async (query) => {
    try {
        const city = query.city.trim();
        const country = query.country; // 2-letter ISO code like 'PK'

        // Dynamic URL with city + country
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&countrycodes=${country}&format=json&limit=1&addressdetails=1`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'YourApp/1.0'
            },
            timeout: 10000
        });

        // Check if data exists AND has results
        if (response.data && response.data.length > 0) {
            const location = response.data[0];
            logger.info(`lat: ${location.lat}, lon: ${location.lon}`);

            return {
                latitude: location.lat,
                longitude: location.lon,
            };
        } else {
            throw new Error(`No results found for ${city}, ${country}`);
        }

    } catch (err) {
        logger.error('Geocoding error:', err.message);
        throw new Error(`City "${query.city}" not found in ${query.country}`);
    }
};

export default { getWeather, getLatLon };
