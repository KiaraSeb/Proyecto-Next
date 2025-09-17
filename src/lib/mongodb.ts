import mongoose from "mongoose";

async function connectDB() {
  if (mongoose.connection.readyState >= 1) return;

  try {
    await mongoose.connect(process.env.MONGODB_URI!);
    console.log("✅ MongoDB conectado correctamente");
  } catch (err) {
    console.log("❌ Error al conectar a MongoDB:", err);
  }
}

export default connectDB;
