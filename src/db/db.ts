import mongoose from "mongoose";

export const connectDB = async () => {
    const connectionString =
        process.env.MONGODB_URI ??
        process.env.MONGO_URI ??
        "mongodb://127.0.0.1:27017/chat-app";

    try {
        await mongoose.connect(connectionString);
        console.log("Connected to MongoDB");
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        throw error;
    }
};
