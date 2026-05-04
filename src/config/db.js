import mongoose from "mongoose";

export const connectMongoDB = async () => {
  try {
    const mongoUrl = process.env.MONGO_URL;
    await mongoose.connect(mongoUrl);
    console.log("MongoDB connected");
  } catch (err) {
    console.error("Mongo error:", err.message);
    process.exit(1);
  }
};
