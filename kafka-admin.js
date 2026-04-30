import { kafkaClient } from "./kafka-client.js";
async function setup(){
    const admin=kafkaClient.admin();
    await admin.connect(); // connects to kafka broker
    console.log("Kafka admin connected");
    
    await admin.createTopics({
        topics:[{topic:"location-updates", numPartitions:2}]
    })
    await admin.disconnect();
}
setup();