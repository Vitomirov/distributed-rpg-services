Zentrix RPG - Microservices System
A scalable RPG game system built with a microservice architecture. Players can create characters, manage equipment (grant/gift items), and engage in real-time combat with automated loot mechanics.

🏗 Architecture
The system consists of three core services:

Account Service: Handles JWT-based authentication and user roles (User/GameMaster).

Character Service: Manages characters, classes, and items. Includes Redis caching for character stats.

Combat Service: Orchestrates duels, turn-based actions (Attack, Cast, Heal), and loot distribution upon victory.

🛠 Tech Stack
Backend: Node.js, TypeScript, Express

Database: PostgreSQL (TypeORM)

Caching: Redis

Infrastructure: Docker Compose

🚀 Getting Started
1. Prerequisites
Ensure you have the following installed:

Docker & Docker Compose

jq (command-line JSON processor, used for the simulation script)

2. Installation
Clone the repository and spin up the environment:

Bash

docker-compose up --build
Note: Migrations and database seeding (initial classes and items) run automatically on startup.

3. Running the Simulation
To verify the entire system flow—including registration, item gifting, combat, and loot transfer—run the provided automation script:

Bash

chmod +x simulate_rpg.sh
npm run simulation
🧪 Testing
Unit tests are included for core business logic (stat calculation and naming conventions). To run tests within a service:

Bash

npm test
📋 API Overview
Auth: POST /api/auth/register, POST /api/auth/login

Characters: GET /api/character (GM only), POST /api/character

Items: POST /api/items/grant, POST /api/items/gift

Combat: POST /api/combat/challenge, POST /api/combat/:duelId/cast