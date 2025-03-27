import mongoose from "mongoose";

export const dbConnect = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGODB_URI);
    if (db.connection) {
      console.log("MongoDB Connected Successfully");
    }
  } catch (error) {
    console.log("Error DB Connection", error.message);
    process.exit(1);
  }
};
