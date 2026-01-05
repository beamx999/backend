const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const pool = require("./config/db");
const { swaggerUi, specs } = require("./swagger");

// Routes
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const customerRoutes = require("./routes/customerRoutes");
const menuRoutes = require("./routes/menuRoutes");
const orderRoutes = require("./routes/orderRoutes");
const app = express();

dotenv.config();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Swagger UI
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(specs, {
    customCssUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui.min.css",
    customJs: [
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-bundle.js",
      "https://cdnjs.cloudflare.com/ajax/libs/swagger-ui/5.0.0/swagger-ui-standalone-preset.js",
    ],
  })
);

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/menus", menuRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.send("Server is running on port : " + PORT);
});

app.get("/ping", async (req, res) => {
  const [rows] = await pool.query("SELECT now() AS now");
  res.json({
    status: "ok",
    time: rows[0].now,
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log("Server is running on port : " + PORT);
  });
}

module.exports = app;
