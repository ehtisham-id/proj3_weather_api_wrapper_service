import mongoose from 'mongoose';
import pino from 'pino';

const logger = pino();

const connectDB = async () => {
    while (true) {
        try {
            await mongoose.connect(process.env.MONGO_URI);
            logger.info('MongoDB connected successfully');
            break; // exit loop when successful
        } catch (err) {
            logger.error(`MongoDB connection error: ${err}`);
            logger.info('Retrying in 5 seconds...');
            await new Promise(resolve => setTimeout(resolve, 5000));
        }
    }
};

export default connectDB;