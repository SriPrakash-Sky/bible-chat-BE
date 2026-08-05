import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Chat API",
    description: "Chat Module APIs",
  },
  host: "localhost:5000/api/chat",
  schemes: ["http"],
};

const outputFile = "./swagger-output.json";

const routes = ["../routes/chatRoutes.js"];

swaggerAutogen()(outputFile, routes, doc);
