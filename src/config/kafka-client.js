import {Kafka} from "kafkajs"
export const kafkaClient= new Kafka({
    clientId: "yashika",
    brokers:["localhost:9092"]
})