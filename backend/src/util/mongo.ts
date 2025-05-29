import mongoose from 'mongoose';
import { env } from './config';

export const connectMongo = async () => {
  await mongoose.connect(`mongodb://${env.DB_IP}:${env.DB_PORT}/${env.DB_NAME}`);
  console.log('Connected to MongoDB');
};
