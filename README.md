# Black Relay

<div align="center">
  <img src="docs/img/ahrbrlogo.png" width="350" alt="Black Relay Logo"/>

  **First Responder Crisis Management Platform**

  *Creating a common operating picture through real-time sensor intelligence*

  [![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
  [![Node.js](https://img.shields.io/badge/node.js-20+-green.svg)](https://nodejs.org/)
  [![React](https://img.shields.io/badge/react-19-61dafb.svg)](https://react.dev/)
  [![MongoDB](https://img.shields.io/badge/mongodb-8.2-47A248.svg)](https://www.mongodb.com/)
</div>

---

## 🎯 Mission

When crisis strikes, **information is survival**. First responders need a unified view of the operational environment—sensor data, environmental readings, threat assessments—all in real-time, all in one place.

Black Relay was born from a hackathon organized by [Arrowhead Research](https://softunlocked.com), an organization dedicated to bridging intelligence, special operations expertise, and corporate leadership. Leveraging methodologies from former intelligence and special operations professionals, our mission is to **aggregate IoT sensor data from edge devices and transform it into actionable intelligence** for emergency coordinators.

Whether it's a natural disaster, hazmat situation, or tactical operation, Black Relay creates a **common operating picture** that helps responders make informed decisions when every second counts.

---

## ✨ Key Features

### 🔴 Real-Time Sensor Integration

- **MQTT-based data ingestion** from edge compute sensors
- Supports multiple sensor types: temperature, motion, air quality, gas detection, WiFi reconnaissance, and more
- Automatic event storage and categorization

### 📊 Event Management & Escalation

- Four-tier escalation system: **DETECT** → **ALERT** → **ALARM** → **THREAT**
- Event acknowledgment tracking
- Historical event querying with timestamp filters
- Flexible JSON payloads for diverse sensor data

### 🗺️ Geographic Visualization

- Interactive maps powered by Leaflet.js and OpenStreetMap
- Real-time sensor location tracking
- Situational awareness through geographic context

### 🔐 Role-Based Access Control

- Admin and analyst user roles
- Session-based authentication with JWT
- Secure, httpOnly cookie implementation

### 🚀 Modern Tech Stack

- **Backend:** Node.js/Express with MongoDB
- **Frontend:** React 19 with TypeScript, Vite, and Tailwind CSS
- **Infrastructure:** Dockerized microservices, MQTT broker (Mosquitto), Caddy reverse proxy
- **Maps:** Self-hosted OpenStreetMap tile server

---

## 🏗️ Architecture

```
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   Edge      │         │    MQTT      │         │   Express   │
│  Sensors    │────────▶│   Broker     │────────▶│     API     │
│             │  MQTT   │ (Mosquitto)  │  Sub    │             │
└─────────────┘         └──────────────┘         └──────┬──────┘
                                                         │
                                                         │ REST API
                                                         ▼
┌─────────────┐         ┌──────────────┐         ┌─────────────┐
│   React     │         │   MongoDB    │         │     OSM     │
│  Dashboard  │◀────────│   Database   │         │ Tile Server │
│  (Leaflet)  │  Query  │   (Events)   │         │    (Maps)   │
└─────────────┘         └──────────────┘         └─────────────┘
```

**Data Flow:**

1. Edge sensors publish JSON data to MQTT topics
2. Backend subscribes to topics and listens for messages
3. Incoming messages automatically stored as events in MongoDB
4. Frontend queries events via REST API
5. Dashboard displays events with geographic context

---

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 20+ (for local development)
- npm or yarn

### Development Environment

```bash
# Clone the repository
git clone https://github.com/Black-Relay/web-app
cd web-app/docker-compose/dev

# Start all services
docker compose up -d

# Access the application
# Frontend: http://localhost:5173
# API: http://localhost:3001
# API Docs: http://localhost:3001/docs
```

**Default Login Credentials:**

- Username: `admin`
- Password: `admin`

### Seed the Database

```bash
cd api
npm run seed
```

### Send Test Sensor Data

```bash
# Python script (requires paho-mqtt)
pip install paho-mqtt
python3 scripts/send_sensor_data.py -b mqtt://localhost:1883 -t environment_sensor
```

---

## 📚 Documentation

| Document                                          | Description                               |
| ------------------------------------------------- | ----------------------------------------- |
| [Backend Architecture](/docs/BACKEND.md)          | API design, database schemas, ERD         |
| [Development Guide](/docs/DEVELOPMENT.md)         | Setup instructions, workflows, commands   |
| [Session Fix](/docs/SESSION_FIX_SUMMARY.md)       | Authentication persistence implementation |
| [Nginx SPA Fix](/docs/NGINX_SPA_FIX_REVIEW.md)    | React Router production routing solution  |
| [MQTT Sender Tool](/docs/MQTT_SENDER_README.md)   | Testing tool for sensor data simulation   |
| [Registry Setup](/docs/REGISTRY_SETUP_SUMMARY.md) | GitHub Container Registry configuration   |

---

## 🧪 Testing & Development

### Available Test Sensor Topics

| Topic              | Description                 | Use Case                 |
| ------------------ | --------------------------- | ------------------------ |
| `digital_temp`     | Temperature monitoring      | Environmental conditions |
| `motion`           | Motion detection events     | Perimeter security       |
| `accelerometer`    | Vibration/acceleration data | Structural monitoring    |
| `air_quality`      | PPM readings                | Hazmat situations        |
| `gas`              | CO2/VOC detection           | Atmospheric hazards      |
| `optical_distance` | Proximity measurements      | Object detection         |
| `proximity_light`  | Light sensor data           | Visibility assessment    |
| `kismet`           | WiFi packet capture         | Network reconnaissance   |

### Key Commands

```bash
# View MongoDB data
docker exec -it mongodb mongosh -u admin -p password

# Subscribe to MQTT topic (verify data flow)
mosquitto_sub -h localhost -p 1883 -t {topic} -v

# Run dummy data generators
cd api && npm run dummy

# Cleanup environment
docker compose down --rmi local && docker volume rm api_mongodb_data
```

---

## 🎨 Tech Stack

<table>
<tr>
<td valign="top" width="50%">

**Backend**

- Node.js 20+ / Express 5
- MongoDB 8.2 / Mongoose ODM
- MQTT Client / Mosquitto 2.0
- JWT Authentication
- Swagger API Docs

</td>
<td valign="top" width="50%">

**Frontend**

- React 19 / TypeScript 5.8
- Vite 7 / Tailwind CSS 4
- React Router 7
- Leaflet.js / React-Leaflet
- Radix UI Components

</td>
</tr>
<tr>
<td valign="top" width="50%">

**Infrastructure**

- Docker & Docker Compose
- Caddy (Reverse Proxy)
- Nginx (Static Serving)
- GitHub Actions CI/CD

</td>
<td valign="top" width="50%">

**Services**

- Eclipse Mosquitto (MQTT)
- OpenStreetMap Tile Server
- GitHub Container Registry
- Cloudflare DNS (Production)

</td>
</tr>
</table>

---

## 🛣️ Roadmap

- [x] Real-time MQTT sensor integration
- [x] Event escalation system (DETECT → ALERT → ALARM → THREAT)
- [x] Geographic visualization with maps
- [x] Role-based access control
- [x] Session persistence
- [x] Data visualization dashboards
- [x] CSV/JSON data exports
- [ ] Historical trend analysis
- [ ] Advanced filtering and search
- [x] Mobile responsiveness optimization
- [ ] Automated testing suite

---

## 🤝 Contributing

Black Relay was created during an Arrowhead Research hackathon and is actively being developed. Contributions are welcome!

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **[Arrowhead Research)** - For organizing the hackathon that brought this project to life
- **[Code Metal](https://www.codemetal.ai/)** - For sponsoring the project
- **Open Source Community** - For the amazing tools and libraries that made this possible

---

<div align="center">
  <strong>🎖️ Built for those who run toward danger 🎖️</strong>

  <sub>When crisis strikes, every second counts. Black Relay delivers the intelligence you need, when you need it.</sub>
</div>
