require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

// Database
require("./config/db");

// ==========================
// Middleware (MUST COME FIRST)
// ==========================
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================
// Static Files
// ==========================
app.use(express.static("public"));

// ==========================
// Routes
// ==========================
const paymentRoutes = require("./routes/payment");
const questionRoutes = require("./routes/question");

app.use("/api", paymentRoutes);
app.use("/api", questionRoutes);

// Home
app.get("/", (req, res) => {
    res.sendFile(__dirname + "/public/index.html");
});

// Health Check
app.get("/health", (req, res) => {
    res.json({
        success: true,
        message: "Subscription Payment System Running"
    });
});

// Start Server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("====================================");
    console.log(`Server running on port ${PORT}`);
    console.log("====================================");
});