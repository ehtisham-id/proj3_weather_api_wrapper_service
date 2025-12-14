/**
 * API Key Generation Endpoints Tests
 * Tests for API key management
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { connectTestDB, disconnectTestDB, clearDatabase } from './setup.js';
import Apps from '../app.js';
import User from '../api/models/User.js';
import Token from '../api/models/Token.js';
import ApiKey from '../api/models/ApiKey.js';

const app = Apps.server;

describe('API Key Endpoints', () => {
    let testUser;
    let validToken;

    beforeAll(async () => {
        await connectTestDB();
    });

    beforeEach(async () => {
        // Create test user
        testUser = new User({
            email: 'apitest@example.com',
            password: 'TestPassword123!',
            role: 'user'
        });
        await testUser.save();

        // Create valid JWT token
        const payload = { id: testUser._id, email: testUser.email };
        const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
        const token = jwt.sign(payload, jwtSecret, { expiresIn: '1h' });
        const [id, secretToken] = token.split(':') || [token, null];

        const userToken = new Token({
            id: id,
            user: testUser._id,
            token: secretToken || token
        });
        await userToken.save();
        validToken = token;
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    describe('POST /api/generate', () => {
        test('should generate API key for authenticated user', async () => {
            const response = await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'API key generated successfully');
            expect(response.body).toHaveProperty('apiKey');
            expect(response.body.apiKey).toMatch(/:/); // Should contain id:secret format
        });

        test('should return 401 without authentication token', async () => {
            const response = await request(app)
                .post('/api/generate');

            expect(response.status).toBe(401);
        });

        test('should return 401 with invalid token', async () => {
            const response = await request(app)
                .post('/api/generate')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });

        test('should return 401 with expired token', async () => {
            const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
            const expiredToken = jwt.sign(
                { id: testUser._id, email: testUser.email },
                jwtSecret,
                { expiresIn: '-1h' } // Expired 1 hour ago
            );

            const response = await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${expiredToken}`);

            expect(response.status).toBe(401);
        });

        test('should return 401 with missing Bearer prefix', async () => {
            const response = await request(app)
                .post('/api/generate')
                .set('Authorization', validToken);

            expect(response.status).toBe(401);
        });

        test('should store generated API key in database', async () => {
            await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${validToken}`);

            const apiKeys = await ApiKey.find({ user: testUser._id });
            expect(apiKeys.length).toBeGreaterThan(0);
            expect(apiKeys[0].user.toString()).toBe(testUser._id.toString());
        });

        test('should generate unique API keys for same user', async () => {
            const response1 = await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${validToken}`);

            const response2 = await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response1.status).toBe(200);
            expect(response2.status).toBe(200);
            expect(response1.body.apiKey).not.toBe(response2.body.apiKey);
        });

        test('should return API key in correct format', async () => {
            const response = await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${validToken}`);

            expect(response.status).toBe(200);
            const [id, secret] = response.body.apiKey.split(':');
            expect(id).toBeTruthy();
            expect(secret).toBeTruthy();
            expect(id.length).toBeGreaterThan(0);
            expect(secret.length).toBeGreaterThan(0);
        });

        test('should handle multiple users generating keys independently', async () => {
            // Create second user
            const user2 = new User({
                email: 'apitest2@example.com',
                password: 'TestPassword456!',
                role: 'user'
            });
            await user2.save();

            const payload2 = { id: user2._id, email: user2.email };
            const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
            const token2 = jwt.sign(payload2, jwtSecret, { expiresIn: '1h' });
            const [id2, secretToken2] = token2.split(':') || [token2, null];

            const userToken2 = new Token({
                id: id2,
                user: user2._id,
                token: secretToken2 || token2
            });
            await userToken2.save();

            const response1 = await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${validToken}`);

            const response2 = await request(app)
                .post('/api/generate')
                .set('Authorization', `Bearer ${token2}`);

            expect(response1.status).toBe(200);
            expect(response2.status).toBe(200);
            expect(response1.body.apiKey).not.toBe(response2.body.apiKey);

            // Verify keys belong to correct users
            const user1Keys = await ApiKey.find({ user: testUser._id });
            const user2Keys = await ApiKey.find({ user: user2._id });
            expect(user1Keys.length).toBeGreaterThan(0);
            expect(user2Keys.length).toBeGreaterThan(0);
        });
    });

    describe('GET /api', () => {
        test('should return welcome message', async () => {
            const response = await request(app)
                .get('/api');

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Welcome to the Weather API Wrapper Service V1');
        });

        test('should return JSON response', async () => {
            const response = await request(app)
                .get('/api');

            expect(response.type).toMatch(/json/);
        });
    });
});
