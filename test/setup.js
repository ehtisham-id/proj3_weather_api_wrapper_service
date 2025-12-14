/**
 * Test Setup and Configuration
 * Initializes database mocks and environment for testing
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Set test environment
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
process.env.BASE_URL = 'http://localhost';

// Mock MongoDB connection for testing
export const connectTestDB = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/weather-api-test');
        console.log('Test database connected');
    } catch (error) {
        console.error('Test database connection failed:', error);
        process.exit(1);
    }
};

// Disconnect from test database
export const disconnectTestDB = async () => {
    try {
        await mongoose.disconnect();
        console.log('Test database disconnected');
    } catch (error) {
        console.error('Test database disconnection failed:', error);
    }
};

// Clear all collections
export const clearDatabase = async () => {
    try {
        const collections = mongoose.connection.collections;
        for (const key in collections) {
            const collection = collections[key];
            await collection.deleteMany({});
        }
    } catch (error) {
        console.error('Error clearing database:', error);
    }
};

export default { connectTestDB, disconnectTestDB, clearDatabase };
