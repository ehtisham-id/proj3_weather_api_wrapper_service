import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

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

export default { getWeather };
