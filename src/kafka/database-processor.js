import "dotenv/config"; // add this
import { kafkaClient } from "../config/kafka-client.js";

async function init() {
  const kafkaConsumer = kafkaClient.consumer({
    groupId: `database-processor`,
  });
  await kafkaConsumer.connect();
  await kafkaConsumer.subscribe({
    topics: ["location-updates"],
    fromBeginning: false,
  }); // add await, change to false

  kafkaConsumer.run({
    eachMessage: async ({ topic, partition, message, heartbeat }) => {
      const data = JSON.parse(message.value.toString());

      // Updated log to show new fields (userId instead of socket.id)
      console.log(`[DB] INSERT INTO location_history`, {
        userId: data.userId,
        userName: data.userName,
        latitude: data.latitude,
        longitude: data.longitude,
        timestamp: new Date(data.timestamp).toISOString(),
      });

      await heartbeat();
    },
  });
}
init();
