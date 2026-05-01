import swaggerJsdoc from "swagger-jsdoc";
import { Options } from "swagger-jsdoc";

const options: Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API Documentation",
            version: "1.0.0",
            description: "AI Advertising Platform API",
        },
        servers: [
            {
                url: process.env.BACKEND_URL || `http://localhost:${process.env.PORT || 5000}`,
            },
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
    },
    apis: ["./src/routes/**/*.ts", "./src/modules/**/*.ts"], // where your docs live
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;