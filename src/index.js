const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
dotenv.config();

const authRouter = require("./routes/authRoute.js");

const app = express();
app.use(express.json());
app.use(cors());

const PORT = process.env.PORT || 8080;

if (process.env.CONNECTION_STRING) {
  mongoose
    .connect(process.env.CONNECTION_STRING)
    .then(() => console.log("Connected to MongoDB database"))
    .catch((err) => console.error("Database connection error:", err));
} else {
  console.warn("Warning: CONNECTION_STRING environment variable is not defined.");
}

app.get("/", (req, res) => {
  res.send("Shopper Backend API is running");
});

app.use("/auth", authRouter);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
