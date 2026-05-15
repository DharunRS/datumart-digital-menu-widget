require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { connectDB } = require("./config/db");

const menuRoutes = require("./routes/menu.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const searchRoutes = require("./routes/search.routes");
const eventRoutes = require("./routes/event.routes");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
app.use(express.json());
app.use(morgan("dev"));

app.use("/api/menu", menuRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/search", searchRoutes);
app.use("/api/events", eventRoutes);

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use((req, res) => res.status(404).json({ error: "Route not found" }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || "Internal server error" });
});

connectDB().then(() => {
  app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
});