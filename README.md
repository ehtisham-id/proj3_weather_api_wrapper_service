# Weather API Wrapper Service - API Documentation

## Overview
The API folder contains the core backend logic for the Weather API Wrapper Service. It provides RESTful endpoints for weather data retrieval, user authentication, API key management, and administrative functions.

## Table of Contents
- [Libraries & Dependencies](#libraries--dependencies)
- [Folder Structure](#folder-structure)
- [Features](#features)
- [API Endpoints](#api-endpoints)
- [Models](#models)
- [Middlewares](#middlewares)
- [Services](#services)
- [Utilities](#utilities)

---

## Libraries & Dependencies

### Core Framework
- **express** (^4.22.1) - Web application framework for building RESTful APIs
- **express-rate-limit** (^8.2.1) - Middleware to prevent abuse by rate limiting requests
- **express-validator** (^7.3.1) - Input validation and sanitization middleware

### Authentication & Security
- **jsonwebtoken** (^9.0.3) - JWT token generation and verification
- **bcryptjs** (^3.0.3) - Password hashing and comparison
- **helmet** (^8.1.0) - Security middleware to set HTTP headers
- **cors** (^2.8.5) - Cross-Origin Resource Sharing middleware

### Database
- **mongoose** (^9.0.1) - MongoDB object modeling and validation

### Caching
- **ioredis** (^5.8.2) - Redis client for caching and session management

### HTTP & API Communication
- **axios** (^1.13.2) - HTTP client for making external API requests to weather services

### Email Service
- **nodemailer** (^7.0.11) - Email sending functionality

### Logging & Debugging
- **morgan** (^1.10.1) - HTTP request logger middleware
- **debug** (~2.6.9) - Debugging utility
- **pino** (^10.1.0) - JSON logger

### Utilities
- **dotenv** (^17.2.3) - Environment variable management
- **cookie-parser** (~1.4.4) - Cookie parsing middleware
- **http-errors** (~1.6.3) - HTTP error utilities
- **crypto** (^1.0.1) - Cryptographic functions for secure operations

---

## Folder Structure

```
api/
├── config/              # Configuration files
│   ├── cache.config.js        # Redis/cache configuration
│   ├── database.config.js     # MongoDB connection configuration
│   └── email.config.js        # Email service configuration
├── controllers/         # Request handlers
│   ├── admin.controller.js    # Admin functionalities
│   ├── api.controller.js      # API key generation
│   ├── auth.controller.js     # Authentication logic
│   └── weather.controller.js  # Weather data retrieval
├── middlewares/         # Custom middleware functions
│   ├── adminAuth.middleware.js    # Admin authorization
│   ├── apiAuth.middleware.js      # API key validation
│   ├── jwtAuth.middleware.js      # JWT token verification
│   ├── rateLimiter.middleware.js  # Rate limiting
│   └── requestAuth.middleware.js  # Request validation
├── models/              # Database schemas
│   ├── ApiKey.js        # API key model
│   ├── Token.js         # Session token model
│   └── User.js          # User model
├── routes/              # Route definitions
│   ├── admin.route.js   # Admin routes
│   ├── auth.route.js    # Authentication routes
│   ├── index.route.js   # Main API routes
│   └── weather.route.js # Weather routes
├── services/            # Business logic & external integrations
│   ├── cache.service.js     # Caching operations
│   ├── email.service.js     # Email sending
│   └── weather.service.js   # Weather API integration
├── utils/               # Helper functions
│   ├── apiKey.util.js   # API key generation & validation
│   ├── jwt.util.js      # JWT token utilities
│   └── validator.util.js    # Request validation schemas
└── index.js             # API router export
```

---

## Features

### 🔐 Authentication & Authorization
- **User Registration** - Create new user accounts with email validation
- **User Login** - Authenticate users and generate JWT tokens
- **JWT Authentication** - Protect routes with token-based authentication
- **Admin Authorization** - Role-based access control for admin endpoints
- **Session Management** - Secure cookie-based session handling

### 🔑 API Key Management
- **API Key Generation** - Generate unique API keys for users
- **API Key Validation** - Authenticate requests using API keys
- **Key Tracking** - Monitor API key usage and user tokens

### 🌤️ Weather Services
- **Weather by Coordinates** - Fetch weather data using latitude and longitude
- **Weather by City** - Fetch weather data using city and country names
- **Data Caching** - Cache weather responses to reduce external API calls
- **Error Handling** - Graceful error responses for invalid queries

### ⚡ Performance & Security
- **Rate Limiting** - Prevent abuse with configurable request rate limits
- **Input Validation** - Validate all incoming requests
- **Password Hashing** - Secure password storage using bcryptjs
- **HTTP Security Headers** - Set security headers with Helmet
- **CORS Protection** - Prevent unauthorized cross-origin requests

### 👨‍💼 Admin Features
- **User Statistics** - View user and token statistics
- **Admin Promotion** - Grant admin privileges to users
- **Admin Dashboard** - Admin-only routes for system management

---

## API Endpoints

### Base URL
```
http://localhost:5000/api/v1
```

### 1. Authentication Routes (`/auth`)

#### Register User
```
POST /api/v1/auth/register
```
**Description:** Create a new user account

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "message": "User registered successfully"
}
```

**Status Codes:** 201 (Created), 400 (Bad Request), 500 (Server Error)

---

#### Login User
```
POST /api/v1/auth/login
```
**Description:** Authenticate user and receive JWT token

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "token": "userId:secretToken"
}
```

**Status Codes:** 200 (OK), 400 (Bad Request), 500 (Server Error)

---

### 2. Weather Routes (`/weather`)

#### Get Weather Data
```
GET /api/v1/weather
```
**Description:** Retrieve weather information by coordinates or city/country

**Query Parameters (one of the following combinations required):**
- `lat` (string) - Latitude coordinate
- `lon` (string) - Longitude coordinate

OR

- `city` (string) - City name
- `country` (string) - Country name

**Authentication:** Required (API Key)

**Example Requests:**
```
GET /api/v1/weather?lat=40.7128&lon=-74.0060
GET /api/v1/weather?city=New%20York&country=USA
```

**Response:**
```json
{
  "weather": "Clear",
  "temperature": 22,
  "humidity": 65,
  "windSpeed": 12,
  ...
}
```

**Status Codes:** 200 (OK), 400 (Bad Request), 500 (Server Error)

---

### 3. API Key Routes (`/`)

#### Generate API Key
```
POST /api/v1/generate
```
**Description:** Generate a new API key for authenticated user

**Authentication:** Required (JWT Token)

**Response:**
```json
{
  "message": "API key generated successfully",
  "apiKey": "apiId:apiSecret"
}
```

**Status Codes:** 200 (OK), 500 (Server Error)

---

#### Welcome Endpoint
```
GET /api/v1
```
**Description:** API welcome message and status check

**Response:**
```json
{
  "message": "Welcome to the Weather API Wrapper Service V1"
}
```

---

### 4. Admin Routes (`/admin`)

#### Admin Status Check
```
GET /api/v1/admin
```
**Description:** Verify admin access and get status message

**Authentication:** Required (JWT Token + Admin Role)

**Response:**
```json
{
  "message": "Admin Route Working"
}
```

**Status Codes:** 200 (OK), 401 (Unauthorized), 403 (Forbidden)

---

#### Get Statistics
```
GET /api/v1/admin/stats
```
**Description:** Retrieve user and API key statistics (Admin only)

**Authentication:** Required (JWT Token + Admin Role)

**Response:**
```json
[
  {
    "email": "user@example.com",
    "role": "user",
    "tokens": ["hashedKey1", "hashedKey2"]
  },
  {
    "email": "admin@example.com",
    "role": "admin",
    "tokens": ["hashedKey3"]
  }
]
```

**Status Codes:** 200 (OK), 401 (Unauthorized), 403 (Forbidden), 500 (Server Error)

---

#### Grant Admin Privileges
```
POST /api/v1/admin/:id/make-admin
```
**Description:** Promote a user to admin role

**Path Parameters:**
- `id` (string) - User ID (MongoDB ObjectID)

**Authentication:** Required (JWT Token + Admin Role)

**Response:**
```json
{
  "message": "User granted admin privileges"
}
```

**Status Codes:** 200 (OK), 404 (Not Found), 401 (Unauthorized), 403 (Forbidden), 500 (Server Error)

---

## Models

### User Model
```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  role: String (enum: ['user', 'admin'], default: 'user'),
  createdAt: Date,
  updatedAt: Date
}
```

### ApiKey Model
```javascript
{
  id: String (unique),
  hashedKey: String,
  user: ObjectId (reference to User),
  createdAt: Date,
  updatedAt: Date
}
```

### Token Model
```javascript
{
  id: String,
  user: ObjectId (reference to User),
  token: String,
  createdAt: Date,
  updatedAt: Date
}
```

---

## Middlewares

### `jwtAuth.middleware.js`
Verifies JWT tokens in requests. Extracts user information and attaches it to the request object.
- **Used in:** API key generation, admin routes

### `apiAuth.middleware.js`
Validates API keys from request headers for weather service access.
- **Used in:** Weather endpoints

### `adminAuth.middleware.js`
Checks if the authenticated user has admin privileges.
- **Used in:** Admin routes

### `requestAuth.middleware.js`
Validates incoming request data using express-validator schemas.
- **Used in:** Login, Registration endpoints

### `rateLimiter.middleware.js`
Implements rate limiting to prevent abuse.
- **Used in:** High-traffic endpoints

---

## Services

### Weather Service (`weather.service.js`)
- **getWeatherByLatLon(lat, lon)** - Fetch weather by latitude and longitude
- **getWeatherByCityCountry(city, country)** - Fetch weather by city and country
- Integrates with external weather APIs (via axios)
- Caches results for performance

### Cache Service (`cache.service.js`)
- Manages Redis caching for weather data
- Reduces external API calls
- Improves response time

### Email Service (`email.service.js`)
- Sends verification emails for new registrations
- Uses Nodemailer for email delivery

---

## Utilities

### `jwt.util.js`
- **generateToken(payload)** - Create JWT tokens with user information
- Token format: `userId:secretToken`
- Handles token expiration and validation

### `apiKey.util.js`
- **generateApiKey()** - Generate unique API keys
- Format: `apiId:apiSecret`
- Ensures uniqueness and security

### `validator.util.js`
- **registerValidation** - Validates registration request data
- **loginValidation** - Validates login request data
- Checks email format, password strength, and required fields

---

## Configuration Files

### `database.config.js`
MongoDB connection setup and mongoose configuration

### `cache.config.js`
Redis connection and caching strategy configuration

### `email.config.js`
Email service (Nodemailer) configuration with SMTP settings

---

## Error Handling

All endpoints return appropriate HTTP status codes and error messages:
- **400** - Bad Request (invalid input/parameters)
- **401** - Unauthorized (missing/invalid authentication)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found (resource doesn't exist)
- **500** - Internal Server Error

---

## Security Best Practices Implemented

1. ✅ Password hashing with bcryptjs
2. ✅ JWT-based authentication
3. ✅ API key validation for external requests
4. ✅ Rate limiting to prevent abuse
5. ✅ CORS protection
6. ✅ Security headers with Helmet
7. ✅ Input validation and sanitization
8. ✅ Role-based access control (RBAC)
9. ✅ Secure session cookies (httpOnly, secure, sameSite)
10. ✅ Environment variable protection

---

## Getting Started

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   - Copy `.env.example` to `.env`
   - Set your database URL, JWT secret, and API keys

3. **Start Server**
   ```bash
   npm start          # Production
   npm run dev       # Development with nodemon
   ```

4. **Test API**
   ```bash
   npm test
   ```

---

## Contact & Support

For issues, questions, or contributions, please refer to the main project documentation or contact the development team.
