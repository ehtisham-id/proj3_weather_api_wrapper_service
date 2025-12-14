import axios from 'axios';
import pino from 'pino';
import cacheService from './cache.service.js ';

const logger = pino();

const CACHE_TTL = {
    current: 1800,    // 30 minutes
    hourly: 3600,     // 1 hour
    geocoding: 86400  // 24 hours
};

const getWeatherByLatLon = async (latitude, longitude, city = null, country = null) => {
    try {

        const cacheKey = cacheService.getCacheKey(latitude, longitude, 'current');
        const cachedData = await cacheService.getCache(cacheKey);
        if (cachedData) {
            logger.info(`Cache hit for key: ${cacheKey}`);
            return cachedData;
        }

        const url = `https://api.open-meteo.com/v1/forecast
            ?latitude=${latitude}
            &longitude=${longitude}
            &current_weather=true
            &hourly=temperature_2m,relativehumidity_2m,windspeed_10m
            &timezone=auto`.replace(/\s/g, "");

        const { data } = await axios.get(url);

        // ---- TRANSFORMATION ---- //

        const apiData = {
            location: {
                latitude: data.latitude,
                longitude: data.longitude,
                city: city || null,
                country: country || null,
                timezone: data.timezone,
                elevation: data.elevation
            },

            current: {
                time: data.current_weather.time,
                temperature: data.current_weather.temperature,
                windSpeed: data.current_weather.windspeed
            },

            hourly: data.hourly.time.map((time, index) => ({
                time,
                temperature: data.hourly.temperature_2m[index],
                humidity: data.hourly.relativehumidity_2m[index],
                windSpeed: data.hourly.windspeed_10m[index]
            }))
        };

        // ---- CACHE THE RESULT ---- //
        await cacheService.setCache(cacheKey, apiData, CACHE_TTL.current);
        logger.info(`Cache set for key: ${cacheKey} with TTL: ${CACHE_TTL.current} seconds`);

        return apiData;

    } catch (err) {
        throw new Error("Unable to fetch weather data");
    }
};

const getWeatherByCityCountry = async (city, country) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search
            ?q=${encodeURIComponent(city)}
            &countrycodes=${country}
            &format=json
            &limit=1
            &addressdetails=1`.replace(/\s/g, "");

        const response = await axios.get(url, {
            headers: {
                "User-Agent": "MicroWeather/1.0"
            },
            timeout: 10000
        });

        if (!response.data || response.data.length === 0) {
            throw new Error(`No results found for ${city}, ${country}`);
        }

        const location = response.data[0];

        return getWeatherByLatLon(location.lat, location.lon, city, country);

    } catch (err) {
        throw new Error(`City "${city}" not found in ${country}`);
    }
};


export default { getWeatherByCityCountry, getWeatherByLatLon };