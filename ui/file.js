// Base API Configuration
const BASE_URL = 'http://localhost:5000/api/v1';

// State management
let currentToken = localStorage.getItem('apiToken') || '';
let currentApiKey = localStorage.getItem('apiKey') || '';
let isApiConnected = false;

// DOM Elements
const statusDot = document.getElementById('statusDot');
const statusText = document.getElementById('statusText');
const tokenText = document.getElementById('tokenText');

// Enhanced fetch with CORS handling
async function apiFetch(url, options = {}) {
    // Add CORS mode to options
    const fetchOptions = {
        ...options,
        mode: 'cors',
        credentials: 'omit',
        headers: {
            'Content-Type': 'application/json',
            ...options.headers
        }
    };

    try {
        const response = await fetch(url, fetchOptions);

        // Handle CORS errors
        if (response.type === 'opaque' || response.status === 0) {
            throw new Error('CORS blocked the request. Please enable CORS on your server.');
        }

        // Try to parse JSON, but handle non-JSON responses
        let data;
        const contentType = response.headers.get('content-type');

        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            const text = await response.text();
            data = {
                message: text || `Status: ${response.status}`,
                status: response.status,
                ok: response.ok
            };
        }

        return {
            ok: response.ok,
            status: response.status,
            data: data
        };

    } catch (error) {
        console.error('Fetch error:', error);

        // Provide helpful error messages
        if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
            return {
                ok: false,
                status: 0,
                data: {
                    error: 'Network Error',
                    message: `Cannot connect to ${BASE_URL}. Make sure:\n1. Your API server is running\n2. CORS is enabled on your server\n3. No firewall is blocking port 5000`
                }
            };
        }

        return {
            ok: false,
            status: 0,
            data: {
                error: 'Request Failed',
                message: error.message
            }
        };
    }
}

// Update connection status
function updateStatus(status) {
    if (!statusDot) return;

    statusDot.className = 'status-dot';

    switch (status) {
        case 'connected':
            statusDot.classList.add('connected');
            statusText.textContent = 'Connected';
            statusText.style.color = 'var(--success-color)';
            break;
        case 'disconnected':
            statusDot.classList.add('disconnected');
            statusText.textContent = 'Disconnected';
            statusText.style.color = 'var(--error-color)';
            break;
        case 'checking':
            statusDot.classList.add('checking');
            statusText.textContent = 'Checking...';
            statusText.style.color = 'var(--warning-color)';
            break;
    }
}

// Check API connection
async function checkAPIConnection() {
    updateStatus('checking');

    try {
        // Try multiple endpoints to check connection
        const endpoints = ['', '/auth/login', '/health', '/status'];

        for (const endpoint of endpoints) {
            try {
                const result = await apiFetch(`${BASE_URL}${endpoint}`, {
                    method: 'GET'
                });

                if (result.status !== 0 && !result.data?.message?.includes('Cannot connect')) {
                    isApiConnected = true;
                    updateStatus('connected');
                    showToast('API is connected!', 'success');
                    return;
                }
            } catch (e) {
                continue; // Try next endpoint
            }
        }

        // If all endpoints failed, show disconnected
        isApiConnected = false;
        updateStatus('disconnected');
        showToast('API not reachable. Check server and CORS settings.', 'error');

    } catch (error) {
        isApiConnected = false;
        updateStatus('disconnected');
        showToast('API connection check failed.', 'error');
    }
}

// Show toast notifications
function showToast(message, type = 'info') {
    const backgroundColor = type === 'success' ? '#10b981' :
        type === 'error' ? '#ef4444' :
            type === 'warning' ? '#f59e0b' : '#3b82f6';

    Toastify({
        text: message,
        duration: 3000,
        gravity: "top",
        position: "right",
        backgroundColor: backgroundColor,
        stopOnFocus: true
    }).showToast();
}

// Update token display
function updateTokenDisplay() {
    if (!tokenText) return;

    if (currentToken) {
        const shortToken = currentToken.substring(0, 30) + '...';
        tokenText.textContent = `Token: ${shortToken}`;
        if (tokenDisplay) {
            tokenDisplay.style.borderLeftColor = 'var(--success-color)';
        }
    } else {
        tokenText.textContent = 'No token available. Login first.';
        if (tokenDisplay) {
            tokenDisplay.style.borderLeftColor = 'var(--error-color)';
        }
    }
}

// Helper Functions
function clearToken() {
    currentToken = '';
    localStorage.removeItem('apiToken');
    updateTokenDisplay();
    showToast('Token cleared', 'info');
}

function copyToken() {
    if (!currentToken) {
        showToast('No token to copy', 'error');
        return;
    }

    navigator.clipboard.writeText(currentToken);
    showToast('Token copied to clipboard!', 'success');
}

function pasteToken() {
    const adminTokenInput = document.getElementById('adminToken');
    if (adminTokenInput) {
        adminTokenInput.value = currentToken;
        showToast('Token pasted', 'info');
    }
}

function pasteApiKey() {
    const apiKeyInput = document.getElementById('weatherApiKey');
    if (apiKeyInput) {
        apiKeyInput.value = currentApiKey;
        showToast('API Key pasted', 'info');
    }
}

function copyResponse(responseId) {
    const content = document.getElementById(`${responseId}Content`);
    if (content && content.textContent) {
        navigator.clipboard.writeText(content.textContent);
        showToast('Response copied to clipboard!', 'success');
    }
}

// Toggle between city/country and coordinates input fields
function toggleWeatherMethod() {
    const method = document.querySelector('input[name="weatherMethod"]:checked')?.value;
    const cityFields = document.getElementById('cityCountryFields');
    const coordFields = document.getElementById('coordinatesFields');

    if (!cityFields || !coordFields) return;

    if (method === 'city') {
        cityFields.style.display = 'block';
        coordFields.style.display = 'none';
    } else {
        cityFields.style.display = 'none';
        coordFields.style.display = 'block';
    }
}

// Use current location for coordinates
function useCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latInput = document.getElementById('weatherLat');
                const lonInput = document.getElementById('weatherLon');
                if (latInput && lonInput) {
                    latInput.value = position.coords.latitude.toFixed(6);
                    lonInput.value = position.coords.longitude.toFixed(6);
                    showToast('Location detected and filled!', 'success');
                }
            },
            (error) => {
                showToast('Could not get your location: ' + error.message, 'error');
            }
        );
    } else {
        showToast('Geolocation is not supported by your browser', 'error');
    }
}

// Test Login Endpoint
async function testLogin() {
    const email = document.getElementById('loginEmail')?.value;
    const password = document.getElementById('loginPassword')?.value;

    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }

    const btn = document.querySelector('#loginCard .test-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
    btn.disabled = true;

    try {
        const result = await apiFetch(`${BASE_URL}/auth/login`, {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });

        const responseElement = document.getElementById('loginResponseContent');
        const container = document.getElementById('loginResponse');

        if (responseElement && container) {
            responseElement.textContent = JSON.stringify(result.data, null, 2);
            responseElement.className = result.ok ? 'response-content success' : 'response-content error';
            container.classList.add('show');
        }

        if (result.ok && result.data.token) {
            currentToken = result.data.token;
            localStorage.setItem('apiToken', result.data.token);
            updateTokenDisplay();
            showToast('Login successful! Token saved.', 'success');
        } else if (result.data.message) {
            showToast(result.data.message, 'error');
        }

    } catch (error) {
        const responseElement = document.getElementById('loginResponseContent');
        const container = document.getElementById('loginResponse');
        if (responseElement && container) {
            responseElement.textContent = `Error: ${error.message}`;
            container.classList.add('show');
        }
        showToast('Login request failed.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Test Register Endpoint
async function testRegister() {
    const email = document.getElementById('registerEmail')?.value;
    const password = document.getElementById('registerPassword')?.value;
    const name = document.getElementById('registerName')?.value;

    if (!email || !password) {
        showToast('Please enter email and password', 'error');
        return;
    }

    const btn = document.querySelector('#registerCard .test-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Registering...';
    btn.disabled = true;

    try {
        const payload = { email, password };
        if (name) payload.name = name;

        const result = await apiFetch(`${BASE_URL}/auth/register`, {
            method: 'POST',
            body: JSON.stringify(payload)
        });

        const responseElement = document.getElementById('registerResponseContent');
        const container = document.getElementById('registerResponse');

        if (responseElement && container) {
            responseElement.textContent = JSON.stringify(result.data, null, 2);
            responseElement.className = result.ok ? 'response-content success' : 'response-content error';
            container.classList.add('show');
        }

        if (result.ok) {
            showToast('Registration successful!', 'success');
        } else if (result.data.message) {
            showToast(result.data.message, 'error');
        }

    } catch (error) {
        const responseElement = document.getElementById('registerResponseContent');
        const container = document.getElementById('registerResponse');
        if (responseElement && container) {
            responseElement.textContent = `Error: ${error.message}`;
            container.classList.add('show');
        }
        showToast('Registration failed.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Test Generate API Key Endpoint
async function testGenerate() {
    if (!currentToken) {
        showToast('Please login first to get a token', 'error');
        return;
    }

    const btn = document.querySelector('#generateCard .test-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
    btn.disabled = true;

    try {
        const result = await apiFetch(`${BASE_URL}/generate`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${currentToken}`
            }
        });

        const responseElement = document.getElementById('generateResponseContent');
        const container = document.getElementById('generateResponse');

        if (responseElement && container) {
            responseElement.textContent = JSON.stringify(result.data, null, 2);
            responseElement.className = result.ok ? 'response-content success' : 'response-content error';
            container.classList.add('show');
        }

        if (result.ok && result.data.apiKey) {
            currentApiKey = result.data.apiKey;
            localStorage.setItem('apiKey', result.data.apiKey);
            const apiKeyInput = document.getElementById('weatherApiKey');
            if (apiKeyInput) {
                apiKeyInput.value = result.data.apiKey;
            }
            showToast('API Key generated and saved!', 'success');
        } else if (result.data.message) {
            showToast(result.data.message, 'error');
        }

    } catch (error) {
        const responseElement = document.getElementById('generateResponseContent');
        const container = document.getElementById('generateResponse');
        if (responseElement && container) {
            responseElement.textContent = `Error: ${error.message}`;
            container.classList.add('show');
        }
        showToast('Failed to generate API key.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Test Weather Endpoint - FIXED with proper parameter pairs
async function testWeather() {
    const apiKey = document.getElementById('weatherApiKey')?.value;

    if (!apiKey) {
        showToast('Please enter API key', 'error');
        return;
    }

    // Get the selected method (city/country or lat/lon)
    const method = document.querySelector('input[name="weatherMethod"]:checked')?.value;

    let params = {};

    if (method === 'city') {
        const city = document.getElementById('weatherCity')?.value?.trim();
        const country = document.getElementById('weatherCountry')?.value?.trim();

        if (!city || !country) {
            showToast('Both City and Country are required', 'error');
            return;
        }

        params.city = city;
        params.country = country;

    } else if (method === 'coordinates') {
        const lat = document.getElementById('weatherLat')?.value?.trim();
        const lon = document.getElementById('weatherLon')?.value?.trim();

        if (!lat || !lon) {
            showToast('Both Latitude and Longitude are required', 'error');
            return;
        }

        if (isNaN(lat) || isNaN(lon)) {
            showToast('Latitude and Longitude must be numbers', 'error');
            return;
        }

        params.lat = parseFloat(lat);
        params.lon = parseFloat(lon);
    }

    const btn = document.querySelector('#weatherCard .test-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
    btn.disabled = true;

    try {
        const url = new URL(`${BASE_URL}/weather`);

        // Add parameters to URL
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });

        const result = await apiFetch(url, {
            method: 'GET',
            headers: {
                'x-api-key': apiKey
            }
        });

        const responseElement = document.getElementById('weatherResponseContent');
        const container = document.getElementById('weatherResponse');

        if (responseElement && container) {
            responseElement.textContent = JSON.stringify(result.data, null, 2);
            responseElement.className = result.ok ? 'response-content success' : 'response-content error';
            container.classList.add('show');
        }

        if (!result.ok && result.data.message) {
            showToast(result.data.message, 'error');
        }

    } catch (error) {
        const responseElement = document.getElementById('weatherResponseContent');
        const container = document.getElementById('weatherResponse');
        if (responseElement && container) {
            responseElement.textContent = `Error: ${error.message}`;
            container.classList.add('show');
        }
        showToast('Failed to fetch weather.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Test Weather with Mock Data
function testWeatherMock() {
    const method = document.querySelector('input[name="weatherMethod"]:checked')?.value;

    let mockData;
    if (method === 'city') {
        const city = document.getElementById('weatherCity')?.value || 'London';
        const country = document.getElementById('weatherCountry')?.value || 'UK';

        mockData = {
            "city": city,
            "country": country,
            "temperature": 18,
            "condition": "Partly Cloudy",
            "humidity": 65,
            "wind_speed": 12,
            "coordinates": {
                "lat": 51.5074,
                "lon": -0.1278
            },
            "timestamp": new Date().toISOString(),
            "note": "This is mock data."
        };
    } else {
        const lat = document.getElementById('weatherLat')?.value || '40.7128';
        const lon = document.getElementById('weatherLon')?.value || '-74.0060';

        mockData = {
            "coordinates": {
                "lat": parseFloat(lat),
                "lon": parseFloat(lon)
            },
            "temperature": 22,
            "condition": "Sunny",
            "humidity": 50,
            "wind_speed": 8,
            "city": "New York",
            "country": "USA",
            "timestamp": new Date().toISOString(),
            "note": "This is mock data."
        };
    }

    const responseElement = document.getElementById('weatherResponseContent');
    const container = document.getElementById('weatherResponse');

    if (responseElement && container) {
        responseElement.textContent = JSON.stringify(mockData, null, 2);
        responseElement.className = 'response-content success';
        container.classList.add('show');
    }

    showToast('Mock weather data loaded', 'info');
}

// Test Admin Stats Endpoint
async function testAdminStats() {
    const adminToken = document.getElementById('adminToken')?.value || currentToken;

    if (!adminToken) {
        showToast('Please enter admin token', 'error');
        return;
    }

    const btn = document.querySelector('#adminCard .test-btn');
    if (!btn) return;

    const originalText = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fetching...';
    btn.disabled = true;

    try {
        const result = await apiFetch(`${BASE_URL}/admin/stats`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${adminToken}`,
                'Content-Type': 'application/json'
            }
        });

        const responseElement = document.getElementById('adminResponseContent');
        const container = document.getElementById('adminResponse');

        if (responseElement && container) {
            responseElement.textContent = JSON.stringify(result.data, null, 2);
            responseElement.className = result.ok ? 'response-content success' : 'response-content error';
            container.classList.add('show');
        }

        if (result.ok) {
            showToast('Admin stats retrieved successfully!', 'success');
        } else if (result.data.message) {
            showToast(result.data.message, 'error');
        }

    } catch (error) {
        const responseElement = document.getElementById('adminResponseContent');
        const container = document.getElementById('adminResponse');
        if (responseElement && container) {
            responseElement.textContent = `Error: ${error.message}`;
            container.classList.add('show');
        }
        showToast('Failed to fetch admin stats.', 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
    }
}

// Initialize the dashboard
function initDashboard() {
    updateTokenDisplay();
    checkAPIConnection();

    // Load saved data
    const savedApiKey = localStorage.getItem('apiKey');
    if (savedApiKey) {
        const apiKeyInput = document.getElementById('weatherApiKey');
        if (apiKeyInput) {
            apiKeyInput.value = savedApiKey;
        }
    }

    // Pre-fill login with demo credentials
    const loginEmail = document.getElementById('loginEmail');
    const loginPassword = document.getElementById('loginPassword');
    if (loginEmail && loginPassword) {
        loginEmail.value = 'test@example.com';
        loginPassword.value = 'password123';
    }

    // Initialize weather method toggle
    toggleWeatherMethod();
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function () {
    initDashboard();

    const testConnectionBtn = document.getElementById('testConnection');
    if (testConnectionBtn) {
        testConnectionBtn.addEventListener('click', checkAPIConnection);
    }

    // Add checking status to CSS
    const style = document.createElement('style');
    style.textContent = `
        .status-dot.checking {
            background-color: var(--warning-color);
            box-shadow: 0 0 10px var(--warning-color);
            animation: pulse 1s infinite;
        }
    `;
    document.head.appendChild(style);
});