const mongoose = require("mongoose")

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.DATABASE_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        
        // Handle connection events
        mongoose.connection.on('error', (err) => {
            console.error('MongoDB connection error:', err);
        });
        
        mongoose.connection.on('disconnected', () => {
            console.log('MongoDB disconnected');
        });
        
        mongoose.connection.on('reconnected', () => {
            console.log('MongoDB reconnected');
        });
        
    } catch (error) {
        console.error('Failed to connect to MongoDB:', error);
        process.exit(1); // Exit if database connection fails
    }
}

module.exports = connectDB

