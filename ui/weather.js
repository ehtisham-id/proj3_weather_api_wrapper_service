// ============================================
// Configuration & State Management
// ============================================
const API_BASE_URL = 'http://localhost:5000/api/v1';
let currentWeatherData = null;
let temperatureChart = null;
let humidityChart = null;
let windChart = null;
let hourlyCharts = {};

// DOM Elements
const apiStatusDot = document.getElementById('apiStatusDot');
const apiStatusText = document.getElementById('apiStatusText');

// ============================================
// Initialization Functions
// ============================================

/**
 * Initialize the weather dashboard
 */
function initDashboard() {
    try {
        loadApiKey();
        setupEventListeners();
        setupMethodToggle();
        setDefaultInputs();

        // Check API status but don't block initialization
        setTimeout(checkApiStatus, 500);

        console.log('Weather dashboard initialized successfully');
    } catch (error) {
        console.error('Failed to initialize dashboard:', error);
        showToast('Dashboard initialization failed', 'error');
    }
}

/**
 * Set default input values
 */
function setDefaultInputs() {
    const cityInput = document.getElementById('cityInput');
    const countryInput = document.getElementById('countryInput');
    const latInput = document.getElementById('latInput');
    const lonInput = document.getElementById('lonInput');

    if (cityInput) cityInput.value = 'London';
    if (countryInput) countryInput.value = 'UK';
    if (latInput) latInput.value = '51.5074';
    if (lonInput) lonInput.value = '-0.1278';
}

// ============================================
// API Status & Connection Management
// ============================================

/**
 * Check API connection status
 */
async function checkApiStatus() {
    if (!apiStatusDot || !apiStatusText) return;

    updateApiStatus('checking');

    try {
        // Try multiple connection methods
        const isConnected = await testConnection();

        if (isConnected) {
            updateApiStatus('connected');
        } else {
            updateApiStatus('disconnected');
        }
    } catch (error) {
        console.error('Status check error:', error);
        updateApiStatus('disconnected');
    }
}

/**
 * Test connection to API server
 */
async function testConnection() {
    try {
        // Method 1: Simple fetch with no-cors
        await fetch(`${API_BASE_URL}`, {
            method: 'HEAD',
            mode: 'no-cors',
            cache: 'no-store'
        });
        return true;
    } catch (error) {
        console.log('Method 1 failed:', error.message);
    }

    try {
        // Method 2: Try with timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        await fetch(`${API_BASE_URL}/weather`, {
            method: 'GET',
            mode: 'no-cors',
            signal: controller.signal
        });

        clearTimeout(timeoutId);
        return true;
    } catch (error) {
        console.log('Method 2 failed:', error.message);
    }

    return false;
}

/**
 * Update API status display
 */
function updateApiStatus(status) {
    if (!apiStatusDot || !apiStatusText) return;

    // Clear previous status classes
    apiStatusDot.className = 'status-dot';

    switch (status) {
        case 'connected':
            apiStatusDot.classList.add('connected');
            apiStatusText.textContent = 'Connected';
            apiStatusText.style.color = 'var(--success-color)';
            break;
        case 'disconnected':
            apiStatusDot.classList.add('disconnected');
            apiStatusText.textContent = 'Disconnected';
            apiStatusText.style.color = 'var(--error-color)';
            break;
        case 'checking':
            apiStatusText.textContent = 'Checking...';
            apiStatusText.style.color = 'var(--warning-color)';
            break;
    }
}

// ============================================
// UI Control Functions
// ============================================

/**
 * Setup method toggle between city/country and coordinates
 */
function setupMethodToggle() {
    const methodRadios = document.querySelectorAll('input[name="searchMethod"]');

    if (methodRadios.length === 0) {
        console.warn('Method radio buttons not found');
        return;
    }

    methodRadios.forEach(radio => {
        radio.addEventListener('change', toggleSearchMethod);
    });

    toggleSearchMethod(); // Initialize
}

/**
 * Toggle between city/country and coordinates input fields
 */
function toggleSearchMethod() {
    const method = document.querySelector('input[name="searchMethod"]:checked')?.value;
    const cityFields = document.getElementById('cityFields');
    const coordFields = document.getElementById('coordFields');

    if (!cityFields || !coordFields) {
        console.warn('Search method fields not found');
        return;
    }

    if (method === 'city') {
        cityFields.style.display = 'block';
        coordFields.style.display = 'none';
    } else {
        cityFields.style.display = 'none';
        coordFields.style.display = 'block';
    }
}

/**
 * Use current geolocation
 */
function useMyLocation() {
    if (!navigator.geolocation) {
        showToast('Geolocation is not supported by your browser', 'error');
        return;
    }

    showToast('Getting your location...', 'info');

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const latInput = document.getElementById('latInput');
            const lonInput = document.getElementById('lonInput');

            if (latInput && lonInput) {
                latInput.value = position.coords.latitude.toFixed(6);
                lonInput.value = position.coords.longitude.toFixed(6);
                showToast('Location detected!', 'success');
            }
        },
        (error) => {
            showToast('Could not get location: ' + error.message, 'error');
        }
    );
}

/**
 * Load API key from localStorage
 */
function loadApiKey() {
    const savedKey = localStorage.getItem('apiKey');
    const apiKeyInput = document.getElementById('apiKeyInput');

    if (savedKey && apiKeyInput) {
        apiKeyInput.value = savedKey;
    }
}

// ============================================
// Data Fetching & Processing
// ============================================

/**
 * Fetch weather data from API
 */
async function fetchWeather() {
    // Validate API key
    const apiKey = document.getElementById('apiKeyInput')?.value?.trim();
    if (!apiKey) {
        showToast('Please enter API key', 'error');
        return;
    }

    // Get search method and parameters
    const method = document.querySelector('input[name="searchMethod"]:checked')?.value;
    const url = new URL(`${API_BASE_URL}/weather`);

    // Build query parameters
    if (method === 'city') {
        const city = document.getElementById('cityInput')?.value?.trim();
        const country = document.getElementById('countryInput')?.value?.trim();

        if (!city || !country) {
            showToast('Please enter both city and country', 'error');
            return;
        }

        url.searchParams.append('city', city);
        url.searchParams.append('country', country);
    } else {
        const lat = document.getElementById('latInput')?.value?.trim();
        const lon = document.getElementById('lonInput')?.value?.trim();

        if (!lat || !lon) {
            showToast('Please enter both latitude and longitude', 'error');
            return;
        }

        if (isNaN(lat) || isNaN(lon)) {
            showToast('Latitude and longitude must be numbers', 'error');
            return;
        }

        url.searchParams.append('lat', parseFloat(lat));
        url.searchParams.append('lon', parseFloat(lon));
    }

    // Show loading state
    const searchBtn = document.querySelector('.search-btn');
    if (!searchBtn) return;

    const originalText = searchBtn.innerHTML;
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
    searchBtn.disabled = true;

    try {
        // Fetch data from API
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || 'Unknown error'}`);
        }

        const data = await response.json();

        // Validate response structure
        if (!data || !data.location || !data.current || !data.hourly) {
            throw new Error('Invalid response structure from API');
        }

        // Process and display data
        processWeatherData(data);
        showToast('Weather data loaded successfully!', 'success');

    } catch (error) {
        console.error('Error fetching weather:', error);
        showToast(`Failed to fetch weather: ${error.message}`, 'error');

        // Fallback to mock data
        showMockData();
    } finally {
        searchBtn.innerHTML = originalText;
        searchBtn.disabled = false;
    }
}

/**
 * Process and display weather data
 */
function processWeatherData(data) {
    currentWeatherData = data;

    // Update all display components
    updateCurrentWeather(data);
    updateCharts(data);
    updateHourlyTable(data);
    updateMapCoordinates(data);

    // Show all sections
    showWeatherSections();
}

// ============================================
// Display Update Functions
// ============================================

/**
 * Update current weather display
 */
function updateCurrentWeather(data) {
    // Helper function to safely update element
    const updateElement = (id, value) => {
        const element = document.getElementById(id);
        if (element) element.textContent = value || '--';
    };

    // Location information
    if (data.location) {
        updateElement('locationName', `${data.location.city || 'Unknown'}, ${data.location.country || 'Unknown'}`);
        updateElement('coordinates', `Coordinates: ${data.location.latitude?.toFixed(4) || '0.0000'}° N, ${data.location.longitude?.toFixed(4) || '0.0000'}° W`);
        updateElement('elevation', `${data.location.elevation || 0}m`);
        updateElement('timezone', data.location.timezone || 'Unknown');
    }

    // Current weather
    if (data.current) {
        updateElement('temperature', `${data.current.temperature?.toFixed(1) || '--'}°`);
        updateElement('currentWindSpeed', `${data.current.windSpeed?.toFixed(1) || '--'} km/h`);
        updateElement('currentTime', formatTime(data.current.time) || '--:--');

        // Update condition display
        const condition = document.getElementById('condition');
        const weatherIcon = document.getElementById('weatherIcon');

        if (condition && weatherIcon) {
            const temp = data.current.temperature || 0;
            const conditionInfo = getWeatherCondition(temp);

            condition.textContent = conditionInfo.text;
            weatherIcon.className = `weather-icon wi ${conditionInfo.icon}`;
        }
    }

    // Last updated timestamp
    updateElement('lastUpdated', `Last updated: ${new Date().toLocaleTimeString()}`);
}

/**
 * Update charts with weather data
 */
function updateCharts(data) {
    // Check if chart containers exist
    const chartIds = ['tempChart', 'humidityChart', 'windChart', 'correlationChart'];
    const chartElements = chartIds.map(id => document.getElementById(id));

    if (chartElements.some(el => !el)) {
        console.warn('Some chart containers not found');
        return;
    }

    // Prepare hourly data (first 24 hours)
    const hourlyData = data.hourly?.slice(0, 24) || [];
    const timeLabels = hourlyData.map(h => formatTime(h.time));
    const temperatures = hourlyData.map(h => h.temperature);
    const humidities = hourlyData.map(h => h.humidity);
    const windSpeeds = hourlyData.map(h => h.windSpeed);

    // Destroy existing charts
    [temperatureChart, humidityChart, windChart, hourlyCharts.correlation].forEach(chart => {
        if (chart) chart.destroy();
    });

    // Create new charts
    createTemperatureChart(timeLabels, temperatures);
    createHumidityChart(timeLabels, humidities);
    createWindChart(timeLabels, windSpeeds);
    createCorrelationChart(temperatures, humidities);
}

/**
 * Create temperature chart
 */
function createTemperatureChart(labels, data) {
    const canvas = document.getElementById('tempChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    temperatureChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Temperature (°C)',
                data: data,
                borderColor: '#e74c3c',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } }
        }
    });
}

/**
 * Create humidity chart
 */
function createHumidityChart(labels, data) {
    const canvas = document.getElementById('humidityChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    humidityChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Humidity (%)',
                data: data,
                backgroundColor: 'rgba(52, 152, 219, 0.7)',
                borderColor: 'rgba(52, 152, 219, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, max: 100 }
            },
            plugins: { legend: { display: true } }
        }
    });
}

/**
 * Create wind speed chart
 */
function createWindChart(labels, data) {
    const canvas = document.getElementById('windChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    windChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Wind Speed (km/h)',
                data: data,
                borderColor: '#2ecc71',
                backgroundColor: 'rgba(46, 204, 113, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } }
        }
    });
}

/**
 * Create temperature-humidity correlation chart
 */
function createCorrelationChart(temperatures, humidities) {
    const canvas = document.getElementById('correlationChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    hourlyCharts.correlation = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Temperature vs Humidity',
                data: temperatures.map((temp, index) => ({
                    x: temp,
                    y: humidities[index]
                })),
                backgroundColor: 'rgba(155, 89, 182, 0.6)',
                borderColor: 'rgba(155, 89, 182, 1)',
                pointRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: true } }
        }
    });
}

/**
 * Update hourly data table
 */
function updateHourlyTable(data) {
    const tableBody = document.getElementById('hourlyTableBody');
    if (!tableBody) return;

    tableBody.innerHTML = '';

    const hourlyData = data.hourly?.slice(0, 24) || [];

    hourlyData.forEach((hour, index) => {
        const row = document.createElement('tr');
        const time = formatTime(hour.time);
        const date = new Date(hour.time);
        const day = date.toLocaleDateString('en-US', { weekday: 'short' });

        // Determine temperature trend
        let trendIcon = '→';
        if (index > 0) {
            const prevTemp = hourlyData[index - 1].temperature;
            if (hour.temperature > prevTemp) {
                trendIcon = '↑';
            } else if (hour.temperature < prevTemp) {
                trendIcon = '↓';
            }
        }

        row.innerHTML = `
            <td>
                <span class="day-label">${day}</span><br>
                <span class="time-label">${time}</span>
            </td>
            <td class="temp-cell">
                <span class="temperature-value">${hour.temperature?.toFixed(1) || '--'}°C</span>
                <span class="trend-icon">${trendIcon}</span>
            </td>
            <td>
                <div class="humidity-display">
                    <div class="humidity-bar">
                        <div class="humidity-fill" style="width: ${hour.humidity || 0}%"></div>
                    </div>
                    <span class="humidity-value">${hour.humidity || 0}%</span>
                </div>
            </td>
            <td>
                <div class="wind-display">
                    <i class="fas fa-wind"></i>
                    <span class="wind-value">${hour.windSpeed?.toFixed(1) || '--'} km/h</span>
                </div>
            </td>
            <td>
                <i class="weather-icon wi ${getWeatherIcon(hour.temperature)} condition-icon"></i>
            </td>
            <td>
                <span class="feels-like">${calculateFeelsLike(hour.temperature, hour.humidity, hour.windSpeed).toFixed(1)}°C</span>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

/**
 * Update map coordinates display
 */
function updateMapCoordinates(data) {
    const coords = document.getElementById('mapCoordinates');
    if (coords && data.location) {
        coords.textContent =
            `Coordinates: ${data.location.latitude?.toFixed(4) || '0.0000'}° N, ${data.location.longitude?.toFixed(4) || '0.0000'}° W | ` +
            `Elevation: ${data.location.elevation || 0}m | ` +
            `Timezone: ${data.location.timezone || 'Unknown'}`;
    }
}

/**
 * Show all weather sections with animation
 */
function showWeatherSections() {
    const sections = [
        'currentWeather',
        'chartsSection',
        'hourlySection',
        'mapSection'
    ];

    sections.forEach((id, index) => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'block';
            element.style.animation = `fadeIn 0.5s ease-out ${index * 0.1}s both`;
        }
    });
}

// ============================================
// Utility Functions
// ============================================

/**
 * Format time for display
 */
function formatTime(dateTimeStr) {
    if (!dateTimeStr) return '';

    try {
        const date = new Date(dateTimeStr);
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (e) {
        return dateTimeStr.split('T')[1]?.substring(0, 5) || dateTimeStr;
    }
}

/**
 * Get weather condition based on temperature
 */
function getWeatherCondition(temperature) {
    const temp = temperature || 0;

    if (temp > 30) return { text: 'Hot', icon: 'wi-day-sunny' };
    if (temp > 25) return { text: 'Warm', icon: 'wi-day-sunny' };
    if (temp > 20) return { text: 'Mild', icon: 'wi-day-cloudy' };
    if (temp > 10) return { text: 'Cool', icon: 'wi-cloud' };
    if (temp > 0) return { text: 'Cold', icon: 'wi-snowflake-cold' };
    return { text: 'Freezing', icon: 'wi-snowflake-cold' };
}

/**
 * Get weather icon class
 */
function getWeatherIcon(temperature) {
    const temp = temperature || 0;

    if (temp > 30) return 'wi-day-sunny';
    if (temp > 25) return 'wi-day-cloudy';
    if (temp > 15) return 'wi-cloud';
    if (temp > 5) return 'wi-cloudy';
    if (temp <= 5) return 'wi-snowflake-cold';
    return 'wi-day-sunny';
}

/**
 * Calculate feels-like temperature
 */
function calculateFeelsLike(temp, humidity, windSpeed) {
    let feelsLike = temp || 0;

    // Simple approximation
    if (temp > 27) {
        feelsLike += (humidity / 100) * 0.1;
    }

    if (temp < 10 && windSpeed > 5) {
        feelsLike -= (windSpeed / 10) * 0.5;
    }

    return feelsLike;
}

// ============================================
// Mock Data & Fallback
// ============================================

/**
 * Show mock data for demonstration
 */
function showMockData() {
    const mockData = {
        location: {
            latitude: parseFloat(document.getElementById('latInput')?.value) || 51.5074,
            longitude: parseFloat(document.getElementById('lonInput')?.value) || -0.1278,
            city: document.getElementById('cityInput')?.value || 'London',
            country: document.getElementById('countryInput')?.value || 'UK',
            timezone: 'Europe/London',
            elevation: 35
        },
        current: {
            time: new Date().toISOString().slice(0, 16),
            temperature: 18.5,
            windSpeed: 12.3
        },
        hourly: []
    };

    // Generate mock hourly data
    const now = new Date();
    for (let i = 0; i < 24; i++) {
        const hourTime = new Date(now.getTime() + i * 60 * 60 * 1000);
        mockData.hourly.push({
            time: hourTime.toISOString().slice(0, 16),
            temperature: 18.5 + (Math.sin(i * 0.3) * 5),
            humidity: 50 + (Math.sin(i * 0.2) * 20),
            windSpeed: 10 + (Math.sin(i * 0.4) * 8)
        });
    }

    processWeatherData(mockData);
    showToast('Showing mock data for demonstration', 'info');
}

// ============================================
// Event Listeners & UI Setup
// ============================================

/**
 * Setup event listeners
 */
function setupEventListeners() {
    // Refresh button
    const refreshBtn = document.getElementById('refreshWeather');
    if (refreshBtn) {
        refreshBtn.addEventListener('click', () => {
            if (currentWeatherData) {
                fetchWeather();
                showToast('Refreshing weather data...', 'info');
            }
        });
    }

    // Enter key in search inputs
    const inputs = document.querySelectorAll('.search-form input');
    inputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                fetchWeather();
            }
        });
    });
}

/**
 * Show toast notification
 */
function showToast(message, type = 'info') {
    const backgroundColor = type === 'success' ? '#2ecc71' :
        type === 'error' ? '#e74c3c' :
            type === 'warning' ? '#f39c12' : '#3498db';

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true
    }).showToast();
}

// ============================================
// Initialize on Load
// ============================================
document.addEventListener('DOMContentLoaded', initDashboard);