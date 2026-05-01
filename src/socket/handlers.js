export function registerSocketHandlers(io, kafkaProducer) {
    io.on("connection", (socket) => {
      console.log(`Socket: ${socket.user.name}`);
  
      socket.on("client:location:update", async ({ latitude, longitude }) => {
        if (
          typeof latitude !== "number" ||
          typeof longitude !== "number"
        ) return;
  
        await kafkaProducer.send({
          topic: "location-updates",
          messages: [
            {
              key: socket.user.id,
              value: JSON.stringify({
                userId: socket.user.id,
                userName: socket.user.name,
                userPhoto: socket.user.photo,
                latitude,
                longitude,
                timestamp: Date.now(),
              }),
            },
          ],
        });
      });
  
      socket.on("disconnect", () => {
        io.emit("server:user:disconnected", { id: socket.user.id });
      });
    });
  }