import swaggerAutogen from "swagger-autogen";

const doc = {
  info: {
    title: "Chat API",
    description: "Chat Module APIs",
  },
  host: "bible-chat.skyraantech.com/backend/api/chat",
  // host: "localhost:5001/api/chat",
  // schemes: ["http"],
  schemes: ["https"],
};

const outputFile = "./swagger-output.json";

const routes = ["../routes/chatRoutes.js"];

swaggerAutogen()(outputFile, routes, doc);
