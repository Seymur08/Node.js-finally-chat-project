import dotenv from "dotenv";
import mongoose from "mongoose";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

export async function connectDB() {
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("✅ MongoDB-ə qoşuldu");
    } catch (err) {
        console.error("❌ MongoDB xətası:", err);
    }
}

connectDB();

