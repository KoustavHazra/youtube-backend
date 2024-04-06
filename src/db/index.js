import mongoose from 'mongoose';
import { DB_NAME } from '../constants.js';

const MONGODB_URI = process.env.MONGODB_URI;
console.log(`MONGODB_URI :: ${MONGODB_URI}/${DB_NAME}`);

const connectDB = async () => {
    try {
        let connectionInstance = await mongoose.connect(`${MONGODB_URI}/${DB_NAME}`);
        console.log(`Connected to MongoDB :: ${connectionInstance.connection.host}`);
    } catch (error) {
        console.error(`MongoDB connection error :: ${error}`);
        process.exit(1);   
    }
};


export default connectDB;