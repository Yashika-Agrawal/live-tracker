## 🗺️ Live Location Tracker

A real-time location tracking system where authenticated users can share their live location and see other users moving on a map.

This project demonstrates how modern distributed systems handle high-frequency real-time data using WebSockets, Kafka, and event-driven architecture.

---

## 🎯 Features

* Google OAuth 2.0 authentication
* Real-time location updates using Socket.IO
* Kafka-based event streaming for scalability
* Multiple consumers (socket + database processor)
* Live map rendering using Leaflet
* Automatic marker updates for moving users
* Disconnect handling (removes users from map)

---

## 🧠 System Flow

User logs in → JWT issued
↓
Frontend gets location (every 10s)
↓
Socket.IO sends location → Backend
↓
Backend publishes event → Kafka (location-updates)
↓
Kafka Consumer reads event
↓
Socket server broadcasts → all clients
↓
Database processor logs/stores location

---

## 🧰 Tech Stack

* Backend: Node.js, Express
* Realtime: Socket.IO
* Streaming: Kafka (kafkajs)
* Auth: Google OAuth + JWT
* Frontend: HTML, JS, Leaflet

---

## 🔐 Authentication Strategy

* Google OAuth 2.0 is used for login
* Backend generates a JWT after successful authentication
* JWT is stored in localStorage (for simplicity)
* Token is sent via Socket.IO handshake
* Backend verifies token before allowing socket connection

### Why JWT instead of sessions?

* Stateless (better for scaling)
* No shared session store required
* Works well with distributed systems

---

## 🤔 Why Kafka?

Directly broadcasting location updates from the socket server works for small systems, but breaks at scale.

Problems with direct approach:

* Every location update triggers immediate processing
* Tight coupling between socket server and database
* Difficult to scale horizontally

Kafka solves this by:

* Acting as a buffer for high-frequency events
* Decoupling producers (socket server) from consumers
* Allowing multiple independent consumers (socket broadcast + DB processor)

This makes the system scalable and fault-tolerant.

---

## ⚡ Why not direct DB writes?

If each user sends location every 10 seconds:

1000 users → 6000 writes/minute

This creates:

* High database load
* Performance bottlenecks
* Increased latency

Instead:

* Kafka queues events
* A separate consumer processes them
* Writes can be batched or optimized

This reduces load and improves scalability.

---

## 🧠 Consumer Groups

Kafka allows multiple consumers to read the same topic independently using consumer groups.

In this project:

* Socket Server Consumer → broadcasts location updates
* Database Processor Consumer → stores/logs location history

Each consumer group gets the full stream of events.

---

## ⚠️ Tradeoffs & Limitations

* JWT stored in localStorage (vulnerable to XSS)
* OAuth state disabled for simplicity
* No persistent database (location history simulated)
* Multi-tab same user may show duplicate markers
* No stale user timeout handling

In production:

* Use HTTP-only cookies
* Enable CSRF protection
* Add session tracking and cleanup

---

## ⚙️ Setup Instructions

### 1. Clone the repository

git clone <your-repo-link>
cd live-tracker

---

### 2. Install dependencies

npm install

---

### 3. Setup environment variables

Create a .env file from the example:

cp .env.example .env

Then update values inside .env:

PORT=8000

GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
BASE_URL=[http://localhost:8000](http://localhost:8000)

JWT_SECRET=your_secret

KAFKA_BROKER=localhost:9092

---

### 4. Start Kafka (using Docker)

docker-compose up -d

---

### 5. Run the application

Start backend:

node index.js

Start database processor:

node database-processor.js

---

### 6. Open in browser

[http://localhost:8000](http://localhost:8000)

---

## 📌 Assumptions

* Location updates sent every 10 seconds
* Kafka running locally via Docker
* Single-region setup

