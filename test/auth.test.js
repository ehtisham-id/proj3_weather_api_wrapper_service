/**
 * Authentication Endpoints Tests
 * Tests for user registration and login
 */

import request from 'supertest';
import { connectTestDB, disconnectTestDB, clearDatabase } from './setup.js';
import Apps from '../app.js';
import User from '../api/models/User.js';

const app = Apps.server;

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        await connectTestDB();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    describe('POST /api/auth/register', () => {
        test('should register a new user with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'testuser@example.com',
                    password: 'ValidPassword123!'
                });

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('message', 'User registered successfully');

            // Verify user was created in database
            const user = await User.findOne({ email: 'testuser@example.com' });
            expect(user).toBeTruthy();
            expect(user.email).toBe('testuser@example.com');
        });

        test('should not register user with invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'invalid-email',
                    password: 'ValidPassword123!'
                });

            expect(response.status).toBe(422);
            expect(response.body).toHaveProperty('errors');
        });

        test('should not register user with missing password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'testuser@example.com'
                });

            expect(response.status).toBe(422);
        });

        test('should not register user with duplicate email', async () => {
            // Create first user
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'ValidPassword123!'
                });

            // Try to create duplicate
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'duplicate@example.com',
                    password: 'AnotherPassword123!'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'User already exists');
        });

        test('should not register user with weak password', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'testuser@example.com',
                    password: 'weak'
                });

            expect(response.status).toBe(422);
        });

        test('should not register user with missing email', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    password: 'ValidPassword123!'
                });

            expect(response.status).toBe(422);
        });

        test('should handle server errors gracefully', async () => {
            const response = await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'test@example.com',
                    password: ''
                });

            expect(response.status).toBe(422);
        });
    });

    describe('POST /api/auth/login', () => {
        beforeEach(async () => {
            // Create a test user before each login test
            await request(app)
                .post('/api/auth/register')
                .send({
                    email: 'login@example.com',
                    password: 'ValidPassword123!'
                });
        });

        test('should login user with valid credentials', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'ValidPassword123!'
                });

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('token');
            expect(response.body.token).toMatch(/:/); // Token format: id:secret
            expect(response.headers['set-cookie']).toBeDefined();
        });

        test('should not login user with wrong password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'WrongPassword123!'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
        });

        test('should not login user with non-existent email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'nonexistent@example.com',
                    password: 'AnyPassword123!'
                });

            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message', 'Invalid email or password');
        });

        test('should not login with missing email', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    password: 'ValidPassword123!'
                });

            expect(response.status).toBe(422);
        });

        test('should not login with missing password', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com'
                });

            expect(response.status).toBe(422);
        });

        test('should not login with invalid email format', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'invalid-email',
                    password: 'ValidPassword123!'
                });

            expect(response.status).toBe(422);
        });

        test('should set secure cookie on successful login', async () => {
            const response = await request(app)
                .post('/api/auth/login')
                .send({
                    email: 'login@example.com',
                    password: 'ValidPassword123!'
                });

            expect(response.status).toBe(200);
            const setCookieHeader = response.headers['set-cookie'];
            expect(setCookieHeader).toBeDefined();
            expect(setCookieHeader[0]).toContain('sessionToken');
            expect(setCookieHeader[0]).toContain('HttpOnly');
        });
    });
});
