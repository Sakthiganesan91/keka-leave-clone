import swaggerJSDoc from "swagger-jsdoc";

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Leave Management API",
    version: "1.0.0",
    description: "API for managing employee leave requests and policies.",
  },
};

const options = {
  swaggerDefinition,
  apis: ["./routes/*.route.js"],
};

const swaggerSpec = swaggerJSDoc(options);
export default swaggerSpec;
