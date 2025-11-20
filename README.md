# Movie4you - Full Stack Movie Application

A modern full-stack movie application built with React, Node.js, and PostgreSQL.

Quick Start

Prerequisites
- Docker & Docker Compose (recommended)
- OR Node.js 20+ and PostgreSQL (manual setup)

Docker Setup (Recommended)

Works on all platforms: macOS, Windows, Linux
No need to install Node.js, PostgreSQL, or any dependencies manually
Everything runs in isolated containers

1. Clone the repository
   git clone <repository-url>
   cd movieapp

2. Create environment file
   cp .env.example .env

3. Edit .env file
   - Add your TMDb API key: TMDB_API_KEY=your-api-key-here
   - Get API key from: https://www.themoviedb.org/

4. Start the application
   docker-compose up -d

5. Access the application
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5001/api
   - Database: localhost:5432
   - pgAdmin (Database GUI): http://localhost:5050
     - Email: admin@movieapp.com (default)
     - Password: admin (default)

Useful Docker Commands

Container status
   docker-compose ps

View logs
   docker-compose logs -f

View logs for specific service
   docker-compose logs -f backend
   docker-compose logs -f frontend
   docker-compose logs -f postgres
   docker-compose logs -f pgadmin

Stop containers
   docker-compose down

Stop containers and remove volumes
   docker-compose down -v

Restart containers
   docker-compose restart

Rebuild and restart
   docker-compose up -d --build

Accessing Database

Option 1: pgAdmin (Web Interface - Recommended)
   1. Open http://localhost:5050
   2. Login with:
      - Email: admin@movieapp.com
      - Password: admin
   3. Add new server:
      - Name: MovieApp DB
      - Host: postgres (container name)
      - Port: 5432
      - Database: moviehub (or your DB_NAME)
      - Username: postgres (or your DB_USER)
      - Password: postgres (or your DB_PASS)

Option 2: Command Line (psql)
   docker exec -it movieapp-db psql -U postgres -d moviehub

Manual Setup

1. Database Setup
   psql -U postgres
   CREATE DATABASE moviehub;
   \q
   psql -U postgres -d moviehub -f server/database/schema.sql

2. Backend Setup
   cd server
   cp .env.example .env
   Edit .env with your database credentials and TMDb API key
   npm install
   npm run dev

3. Frontend Setup
   cd client
   cp .env.example .env
   npm install
   npm run dev

Project Structure

movieapp/
├── client/          React + TypeScript Frontend
├── server/          Express.js Backend
├── docs/           Documentation
└── docker-compose.yml

Environment Variables

- Root .env: Used by Docker Compose
- server/.env: Backend configuration (manual setup)
- client/.env: Frontend configuration (manual setup)

Documentation

- Project Status: PROJECT_STATUS.md - Feature list and completion status
- Backend API: docs/BACKEND_API.md - API documentation
- Database Model: docs/DATABASE_MODEL.md - Database schema

Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind CSS
- Backend: Node.js, Express.js
- Database: PostgreSQL
- External API: TMDb (The Movie Database)

License

ISC
# movieapp-full
