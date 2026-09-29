import mongoose from "mongoose";

export async function connectDb() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Database connected.");
  } catch (error) {
    console.log("Database not connected..", error);
  }
}
