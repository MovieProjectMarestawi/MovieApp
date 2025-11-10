# Project: The Movie Hub (OAMK Web Application Project)

A full-stack, responsive web application for movie enthusiasts, built for the OAMK Web Application Project course (Autumn 2025). This application features user authentication, movie browsing (via TMDb API), reviews, and social groups.

---

## 🚀 Technology Stack

* **Frontend:** React
* **Backend:** Node.js (with Express.js)
* **Database:** PostgreSQL
* **External API:** The Movie Database (TMDb)
* **API Testing:** Jest & Supertest
* **Authentication:** JSON Web Tokens (JWT)

---

## ✨ Core Features

* **(Req 1)** Fully Responsive UI for all devices.
* **(Req 2-4)** Complete User Management: Register, Login, Logout, and Delete Account.
* **(Req 5-6)** Movie Browsing: Advanced search (3+ criteria) and "Now Playing in Finland" list.
* **(Req 7-10)** Social Groups: Create, join (with approval), manage, and customize groups.
* **(Req 11-12)** Movie Reviews: Logged-in users can write reviews (text + stars), which are visible to all.
* **(Req 13-14)** Favorite Lists: Users can create private favorite lists and share them via a public URL.
* **(Req 15)** Custom Feature: [To Be Defined]
* **(Req 16)** Full deployment to a public URL.

---

## 📊 Project Status

### ✅ Completed Phases

- **Phase 1: Foundation & User Authentication** ✅
  - User registration, login, logout, and account deletion
  - JWT authentication
  - Complete test coverage

- **Phase 2: Core Movie Functionality (TMDb Integration)** ✅
  - Movie search with multiple criteria (query, genre, year)
  - Now playing movies in Finland
  - Movie details and genres
  - Complete test coverage

- **Phase 3: User Interaction (Reviews & Favorites)** ✅
  - Movie reviews (create, read, update, delete)
  - User favorites management
  - Shareable favorites lists
  - Complete test coverage

- **Phase 4: Social Features (Groups)** ✅
  - Group creation and management
  - Join requests with approval system
  - Group membership management
  - Group content (movies) management
  - Complete test coverage

### 🚧 In Progress

- **Phase 5: Finalization & Deployment**
  - Frontend development
  - Custom feature implementation
  - Full responsiveness
  - Deployment

---

## 📚 Documentation

### For Frontend Developers

* **[BACKEND_API.md](./BACKEND_API.md)** - Complete backend API documentation with code examples, request/response formats, and integration guides.

### For Backend Developers

* **[docs/DATABASE_MODEL.md](./docs/DATABASE_MODEL.md)** - Database schema and relationships
* **[docs/DATABASE_README.md](./docs/DATABASE_README.md)** - Database setup instructions
* **[docs/PGADMIN_SETUP.md](./docs/PGADMIN_SETUP.md)** - pgAdmin 4 setup guide

### Project Documentation

* **UI Plan:** https://stitch.withgoogle.com/projects/5959244375673120853
* **Data Model:** https://drive.google.com/file/d/1bSeaG59YCrL8optfts97AZ1po0do8vY4/view?usp=sharing

---

## 🛠️ Getting Started

### Prerequisites

* Node.js (v18 or later)
* PostgreSQL
* A TMDb API Key. Get one from [developer.themoviedb.org](https://developer.themoviedb.org/reference/intro/getting-started)

### Installation & Running

#### 1. Clone the repository:
```bash
git clone [your-repo-url]
cd movie-projektti
```

#### 2. Backend Setup:
```bash
cd server
npm install

# Create a .env file (copy from .env.example)
cp .env.example .env

# Edit .env file and add:
# - DB_HOST, DB_USER, DB_PASS, DB_NAME, DB_PORT
# - JWT_SECRET
# - TMDB_API_KEY

# Run database migrations
# See docs/DATABASE_README.md for setup instructions

# Start development server
npm run dev
```

The backend will run on `http://localhost:5000`

#### 3. Frontend Setup:
```bash
cd client
npm install

# Create a .env file
# REACT_APP_API_URL=http://localhost:5000/api

# Start development server
npm start
```

The frontend will run on `http://localhost:3000`

---

## 🧪 Testing

### Backend Tests

```bash
cd server
npm test
```

**Test Coverage:**
- ✅ 7 test suites
- ✅ 115 tests
- ✅ All tests passing

---

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/me` - Get user profile
- `DELETE /api/users/me` - Delete account

### Movies
- `GET /api/movies/search` - Search movies (query, genre, year)
- `GET /api/movies/now-playing` - Get now playing movies
- `GET /api/movies/:id` - Get movie details
- `GET /api/movies/genres` - Get movie genres
- `GET /api/movies/:id/reviews` - Get movie reviews

### Reviews
- `POST /api/reviews` - Create review
- `GET /api/reviews` - Get all reviews
- `PUT /api/reviews/:id` - Update review
- `DELETE /api/reviews/:id` - Delete review

### Favorites
- `POST /api/users/me/favorites` - Add to favorites
- `GET /api/users/me/favorites` - Get favorites
- `DELETE /api/users/me/favorites/:movieId` - Remove from favorites
- `GET /api/favorites/share/:userId` - Get shareable favorites

### Groups
- `POST /api/groups` - Create group
- `GET /api/groups` - List all groups
- `GET /api/groups/:id` - Get group details
- `DELETE /api/groups/:id` - Delete group
- `POST /api/groups/:id/join` - Request to join group
- `GET /api/groups/:id/requests` - Get join requests (owner only)
- `POST /api/groups/:id/requests/:requestId/approve` - Approve join request
- `POST /api/groups/:id/requests/:requestId/reject` - Reject join request
- `DELETE /api/groups/:id/members/:userId` - Remove member (owner only)
- `DELETE /api/groups/:id/leave` - Leave group
- `POST /api/groups/:id/movies` - Add movie to group
- `GET /api/groups/:id/movies` - Get group movies
- `DELETE /api/groups/:id/movies/:movieId` - Remove movie from group

**For detailed API documentation, see [BACKEND_API.md](./BACKEND_API.md)**

---

## 🗂️ Project Structure

```
movie-projektti/
├── client/                 # React frontend
│   ├── src/
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── routes/         # API routes
│   │   ├── middleware/     # Express middleware
│   │   ├── services/       # External services (TMDb)
│   │   ├── utils/          # Utility functions
│   │   ├── config/         # Configuration files
│   │   └── __tests__/      # Test files
│   ├── database/
│   │   └── schema.sql      # Database schema
│   └── package.json
├── docs/                   # Documentation
│   ├── DATABASE_MODEL.md
│   ├── DATABASE_README.md
│   └── PGADMIN_SETUP.md
├── BACKEND_API.md          # Frontend developer guide
└── README.md               # This file
```

---

## 🔐 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=moviehub
DB_USER=postgres
DB_PASS=postgres

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# TMDb API
TMDB_API_KEY=your-tmdb-api-key-here
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 📝 Development Plan

### Phase 1: Foundation & User Authentication ✅
- Project setup and infrastructure
- User registration, login, logout, account deletion
- JWT authentication
- Database schema (Users table)
- Unit tests

### Phase 2: Core Movie Functionality ✅
- TMDb API integration
- Movie search (query, genre, year)
- Now playing movies
- Movie details and genres
- Unit tests

### Phase 3: User Interaction ✅
- Movie reviews (CRUD operations)
- User favorites management
- Shareable favorites lists
- Database schema updates
- Unit tests

### Phase 4: Social Features ✅
- Group creation and management
- Join request system with approval
- Membership management
- Group content (movies)
- Database schema (Groups, Members, Requests, Content)
- Unit tests

### Phase 5: Finalization & Deployment 🚧
- Frontend development
- Custom feature implementation
- Full responsiveness testing
- Deployment (Database, Backend, Frontend)
- Final documentation

---

## 🤝 Contributing

This is a course project. For questions or issues, please contact the project team.

---

## 📄 License

This project is part of the OAMK Web Application Project course.

---

## 🔗 Links

* **UI Plan:** https://stitch.withgoogle.com/projects/5959244375673120853
* **Data Model:** https://drive.google.com/file/d/1bSeaG59YCrL8optfts97AZ1po0do8vY4/view?usp=sharing
* **TMDb API:** https://developer.themoviedb.org/

---

**Last Updated:** 2025-01-17
**Backend Status:** ✅ Complete (All 4 phases implemented and tested)
**Frontend Status:** 🚧 In Progress
