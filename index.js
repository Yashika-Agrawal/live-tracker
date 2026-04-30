import http from "node:http";
import express from "express";
import {Server} from "socket.io"
import path from "node:path"
import { kafkaClient } from "./kafka-client.js";
async function main(){
    const PORT = process.env.PORT ?? 8000;;
    const app = express();
    const server = http.createServer(app);
    const io = new Server();

    app.use(express.static(path.resolve("./public")));
    const kafkaProducer = kafkaClient.producer();
    await kafkaProducer.connect();

    const kafkaConsumer = kafkaClient.consumer({
        groupId:`socket-sever-${PORT}`,
    });
    await kafkaConsumer.connect();
    kafkaConsumer.subscribe({topics:["location-updates"], fromBeginning:true})

    kafkaConsumer.run({
        eachMessage: async({topic, partition, message, heartbeat})=>{
            const data = JSON.parse(message.value.toString())
            console.log(`kafkaconsumer data received`, {data})
            io.emit('server:location:update', {id:data.id,latitude:data.latitude, longitude:data.longitude })
            await heartbeat();
        }
    })

    io.attach(server); //upgrading existing http server to websocets connection

//whenever a new user connects via socket connection is established ( socket a => user a )
    io.on("connection", async (socket) => { 
        console.log(`Socket id ${socket.id} connected`);
        socket.on("client:location:update", async (locationData)=>{
            const {latitude, longitude}= locationData;
            console.log(`${socket.id} client:location:update`, locationData);
            await kafkaProducer.send({topic:"location-updates", messages:[{
                key:socket.id,
                value:JSON.stringify({id:socket.id,latitude, longitude})
            }]})
        })
        
      });
   
    app.get("/health", (req,res)=>{
        return res.json({healthy:true})
    })

    server.listen(PORT, ()=>console.log(`Server listening on PORT: ${PORT}`))
}
main();