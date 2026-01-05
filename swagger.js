const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const path = require("path");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Food Ordering API",
      version: "1.0.0",
      description: "API สำหรับระบบสั่งอาหาร",
    },
    servers: [
      {
        url: "/",
        description: "Current Server",
      },
      {
        url: "http://localhost:3000",
        description: "Local server",
      },
    ],

    tags: [
      { name: "Auth", description: "Authentication & Authorization" },
      { name: "Users", description: "User management" },
      { name: "Customers", description: "Customer management" },
      { name: "Menus", description: "Food menu management" },
      { name: "Orders", description: "Order processing" },
    ],

    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },

  apis: [path.join(__dirname, "./routes/*.js")],
};

const specs = swaggerJsdoc(options);

module.exports = { swaggerUi, specs };
