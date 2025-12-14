/**
 * Admin Endpoints Tests
 * Tests for admin-only operations
 */

import request from 'supertest';
import jwt from 'jsonwebtoken';
import { connectTestDB, disconnectTestDB, clearDatabase } from './setup.js';
import Apps from '../app.js';
import User from '../api/models/User.js';
import Token from '../api/models/Token.js';
import ApiKey from '../api/models/ApiKey.js';

const app = Apps.server;

describe('Admin Endpoints', () => {
    let adminUser;
    let regularUser;
    let adminToken;
    let userToken;

    beforeAll(async () => {
        await connectTestDB();
    });

    beforeEach(async () => {
        // Create admin user
        adminUser = new User({
            email: 'admin@example.com',
            password: 'AdminPassword123!',
            role: 'admin'
        });
        await adminUser.save();

        // Create regular user
        regularUser = new User({
            email: 'user@example.com',
            password: 'UserPassword123!',
            role: 'user'
        });
        await regularUser.save();

        // Create admin JWT token
        const adminPayload = { id: adminUser._id, email: adminUser.email };
        const jwtSecret = process.env.JWT_SECRET || 'test-secret-key';
        adminToken = jwt.sign(adminPayload, jwtSecret, { expiresIn: '1h' });
        const [adminId, adminSecret] = adminToken.split(':') || [adminToken, null];

        const adminTokenObj = new Token({
            id: adminId,
            user: adminUser._id,
            token: adminSecret || adminToken
        });
        await adminTokenObj.save();

        // Create regular user JWT token
        const userPayload = { id: regularUser._id, email: regularUser.email };
        userToken = jwt.sign(userPayload, jwtSecret, { expiresIn: '1h' });
        const [userId, userSecret] = userToken.split(':') || [userToken, null];

        const userTokenObj = new Token({
            id: userId,
            user: regularUser._id,
            token: userSecret || userToken
        });
        await userTokenObj.save();

        // Create some API keys for stats test
        const key1 = new ApiKey({
            id: 'test-api-1',
            hashedKey: 'secret-1',
            user: adminUser._id
        });
        const key2 = new ApiKey({
            id: 'test-api-2',
            hashedKey: 'secret-2',
            user: regularUser._id
        });
        await key1.save();
        await key2.save();
    });

    afterEach(async () => {
        await clearDatabase();
    });

    afterAll(async () => {
        await disconnectTestDB();
    });

    describe('GET /api/admin', () => {
        test('should return admin status for authenticated admin user', async () => {
            const response = await request(app)
                .get('/api/admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'Admin Route Working');
        });

        test('should return 403 for non-admin authenticated user', async () => {
            const response = await request(app)
                .get('/api/admin')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(app)
                .get('/api/admin');

            expect(response.status).toBe(401);
        });

        test('should return 401 with invalid token', async () => {
            const response = await request(app)
                .get('/api/admin')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });

    describe('GET /api/admin/stats', () => {
        test('should return user and token statistics for admin', async () => {
            const response = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body.length).toBeGreaterThan(0);

            // Check structure of stats
            response.body.forEach(stat => {
                expect(stat).toHaveProperty('email');
                expect(stat).toHaveProperty('role');
                expect(stat).toHaveProperty('tokens');
                expect(Array.isArray(stat.tokens)).toBe(true);
            });
        });

        test('should include all users in stats', async () => {
            const response = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            const emails = response.body.map(stat => stat.email);
            expect(emails).toContain('admin@example.com');
            expect(emails).toContain('user@example.com');
        });

        test('should show correct token count per user', async () => {
            const response = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            const adminStats = response.body.find(stat => stat.email === 'admin@example.com');
            const userStats = response.body.find(stat => stat.email === 'user@example.com');

            expect(adminStats.tokens.length).toBe(1);
            expect(userStats.tokens.length).toBe(1);
        });

        test('should return 403 for non-admin user', async () => {
            const response = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });

        test('should return 401 without authentication', async () => {
            const response = await request(app)
                .get('/api/admin/stats');

            expect(response.status).toBe(401);
        });

        test('should return 401 with invalid token', async () => {
            const response = await request(app)
                .get('/api/admin/stats')
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });
    });

    describe('POST /api/admin/:id/make-admin', () => {
        test('should promote user to admin', async () => {
            const response = await request(app)
                .post(`/api/admin/${regularUser._id}/make-admin`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('message', 'User granted admin privileges');

            // Verify user role was updated
            const updatedUser = await User.findById(regularUser._id);
            expect(updatedUser.role).toBe('admin');
        });

        test('should return 404 for non-existent user', async () => {
            const fakeUserId = '507f1f77bcf86cd799439011'; // Fake MongoDB ID

            const response = await request(app)
                .post(`/api/admin/${fakeUserId}/make-admin`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(404);
            expect(response.body).toHaveProperty('message', 'User not found');
        });

        test('should return 401 without authentication', async () => {
            const response = await request(app)
                .post(`/api/admin/${regularUser._id}/make-admin`);

            expect(response.status).toBe(401);
        });

        test('should return 403 for non-admin user', async () => {
            const anotherUser = new User({
                email: 'anotheruser@example.com',
                password: 'AnotherPassword123!',
                role: 'user'
            });
            await anotherUser.save();

            const response = await request(app)
                .post(`/api/admin/${anotherUser._id}/make-admin`)
                .set('Authorization', `Bearer ${userToken}`);

            expect(response.status).toBe(403);
        });

        test('should return 401 with invalid token', async () => {
            const response = await request(app)
                .post(`/api/admin/${regularUser._id}/make-admin`)
                .set('Authorization', 'Bearer invalid-token');

            expect(response.status).toBe(401);
        });

        test('should not change role if user is already admin', async () => {
            await request(app)
                .post(`/api/admin/${regularUser._id}/make-admin`)
                .set('Authorization', `Bearer ${adminToken}`);

            // Try to promote again
            const response = await request(app)
                .post(`/api/admin/${regularUser._id}/make-admin`)
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(200);

            const user = await User.findById(regularUser._id);
            expect(user.role).toBe('admin');
        });

        test('should return 400 for invalid user ID format', async () => {
            const response = await request(app)
                .post('/api/admin/invalid-id/make-admin')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).toBe(400);
        });
    });
});
