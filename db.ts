import mongoose from "mongoose";

const MONGODB_URI =
  "mongodb+srv://mayank:rRk5ZWiWa8wWV5Iy@mayankcluster.kltxikq.mongodb.net/?retryWrites=true&w=majority&appName=mayankcluster";

console.log("MongoDB connection string:", MONGODB_URI);
if (!MONGODB_URI) {
  throw new Error(
    "MONGODB_URI must be set. Did you forget to add your MongoDB connection string?"
  );
}

// Connect to MongoDB using the connection string from environment variables
mongoose.connect(MONGODB_URI, {
  serverSelectionTimeoutMS: 5000,
  dbName: "mayankSalaryIncomeDB",
});

// MongoDB connection event handlers
mongoose.connection.on("connected", () => {
  console.log("Connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("Disconnected from MongoDB");
});

export const db = mongoose.connection;
