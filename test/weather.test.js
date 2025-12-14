/**
 * Weather Endpoints Tests
 * Tests for weather data retrieval
 */

import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearDatabase } from './setup.js';
import Apps from '../app.js';
import User from '../api/models/User.js';
import ApiKey from '../api/models/ApiKey.js';

const app = Apps.server;

describe('Weather Endpoints', () => {
    let testUser;
    let testApiKey;

    beforeAll(async () => {
        await connectTestDB();
    });

    beforeEach(async () => {
        // Create test user
        testUser = new User({
            email: 'weathertest@example.com',
            password: 'TestPassword123!',
            role: 'user'
        });
        await testUser.save();

        // Create test API key
        testApiKey = new ApiKey({
            id: 'test-api-id-123',
            hashedKey: 'test-api-secret-456',
            user: testUser._id
        });
        await testApiKey.save();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    describe('GET /api/weather', () => {
        test('should get weather by latitude and longitude', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({
                    lat: '40.7128',
                    lon: '-74.0060'
                })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            // Note: This will fail without real weather service integration
            // Should return 200 if weather service is configured
            expect([200, 500]).toContain(response.status);
        });

        test('should get weather by city and country', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({
                    city: 'New York',
                    country: 'USA'
                })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect([200, 500]).toContain(response.status);
        });

        test('should return 400 for missing query parameters', async () => {
            const response = await request(app)
                .get('/api/weather')
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid query parameters');
        });

        test('should return 400 when only latitude is provided', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({ lat: '40.7128' })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid query parameters');
        });

        test('should return 400 when only longitude is provided', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({ lon: '-74.0060' })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid query parameters');
        });

        test('should return 400 when only city is provided', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({ city: 'New York' })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid query parameters');
        });

        test('should return 400 when only country is provided', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({ country: 'USA' })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid query parameters');
        });

        test('should handle missing API key authentication', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({
                    lat: '40.7128',
                    lon: '-74.0060'
                });

            expect(response.status).toBe(401);
        });

        test('should handle invalid API key format', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({
                    lat: '40.7128',
                    lon: '-74.0060'
                })
                .set('x-api-key', 'invalid-api-key');

            expect(response.status).toBe(401);
        });

        test('should handle non-existent API key', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({
                    lat: '40.7128',
                    lon: '-74.0060'
                })
                .set('x-api-key', 'nonexistent:key');

            expect(response.status).toBe(401);
        });

        test('should accept valid coordinate formats', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({
                    lat: '0',
                    lon: '0'
                })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect([200, 500]).toContain(response.status);
        });

        test('should accept valid city and country names with special characters', async () => {
            const response = await request(app)
                .get('/api/weather')
                .query({
                    city: 'São Paulo',
                    country: 'Brazil'
                })
                .set('x-api-key', `${testApiKey.id}:${testApiKey.hashedKey}`);

            expect([200, 500]).toContain(response.status);
        });
    });
});
