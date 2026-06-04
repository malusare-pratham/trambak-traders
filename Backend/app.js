const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const recordRoutes = require("./routes/recordRoutes");
const {
  createRecord,
  updateRecord,
} = require("./controllers/recordController");
const { protect } = require("./middleware/authMiddleware");
const { errorHandler, notFound } = require("./middleware/errorMiddleware");

const app = express();

const allowedOrigins = (process.env.CORS_ORIGIN || process.env.FRONTEND_URL || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Trambkaraj Trader API is running" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/records", recordRoutes);

// Legacy routes kept so the current frontend continues to work.
app.post("/add-record", protect, createRecord);
app.put("/update-record/:id", protect, updateRecord);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
