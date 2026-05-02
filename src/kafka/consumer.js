export async function startKafkaConsumer(kafkaClient, io, PORT) {
  try {
    const consumer = kafkaClient.consumer({
      groupId: `socket-server-${PORT}`,
    });
  
    await consumer.connect();
    await consumer.subscribe({ topic: "location-updates" });
  
    await consumer.run({
      eachMessage: async ({ message }) => {
        const data = JSON.parse(message.value.toString());
  
        io.emit("server:location:update", {
          id: data.userId,
          name: data.userName,
          photo: data.userPhoto,
          latitude: data.latitude,
          longitude: data.longitude,
        });
      },
    });
  } catch (error) {
    console.log("kafka error", error)
  }
    
  }