import "dotenv/config";
import http from "node:http";
import express from "express";
import session from "express-session";
import passport from "passport";
import path from "node:path";
import { Server } from "socket.io";

import { setupPassport } from "./config/passport.js";
import authRoutes from "./auth/routes.js";
import { socketAuthMiddleware } from "./middleware/socketAuth.js";
import { registerSocketHandlers } from "./socket/handlers.js";
import { startKafkaConsumer } from "./kafka/consumer.js";
import { kafkaClient } from "./config/kafka-client.js";

async function main() {
  const PORT = process.env.PORT ?? 8000;

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server);

  // 🧠 Setup passport
  setupPassport();

  // 🧠 Middlewares
  app.use(express.json());

  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
    })
  );

  app.use(passport.initialize());
  app.use(passport.session());

  // 🧠 Auth routes
  app.use("/auth", authRoutes);

  // 🧠 Static files
  app.use(express.static(path.resolve("./public")));

  // 🧠 Kafka producer
  const kafkaProducer = kafkaClient.producer();
  await kafkaProducer.connect();

  // 🧠 Kafka consumer
  await startKafkaConsumer(kafkaClient, io, PORT);

  // 🧠 Socket auth
  io.use(socketAuthMiddleware);

  // 🧠 Socket handlers
  registerSocketHandlers(io, kafkaProducer);

  // 🧠 Health check
  app.get("/health", (req, res) => {
    res.json({ healthy: true });
  });

  server.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

main();