# Project: The Movie Hub (OAMK Web Application Project)

A full-stack, responsive web application for movie enthusiasts, built for the OAMK Web Application Project course (Autumn 2025). This application features user authentication, movie browsing (via TMDb API), reviews, and social groups.

Technology Stack

* Frontend: React
* Backend: Node.js (with Express.js)
* Database: PostgreSQL
* External API: The Movie Database (TMDb)
* API Testing: Jest & Supertest
* Authentication: JSON Web Tokens (JWT)

Core Features

* (Req 1) Fully Responsive UI for all devices.
* (Req 2-4) Complete User Management: Register, Login, Logout, and Delete Account.
* (Req 5-6) Movie Browsing: Advanced search (3+ criteria) and "Now Playing in Finland" list.
* (Req 7-10) Social Groups: Create, join (with approval), manage, and customize groups.
* (Req 11-12) Movie Reviews: Logged-in users can write reviews (text + stars), which are visible to all.
* (Req 13-14) Favorite Lists: Users can create private favorite lists and share them via a public URL.
* (Req 15) Custom Feature: [To Be Defined]
* (Req 16) Full deployment to a public URL.

---

Development Plan (Phased Approach)

Phase 1: Foundation & User Authentication
* Goal: Set up the core project structure, database, and complete all user management features.
* Key Tasks:
    1.  Project Setup (Doc Req 5): Initialize Git repository (Version Control).
    2.  Infrastructure: Set up Node.js/Express server, React application structure, and connect to PostgreSQL database.
    3.  Database Design (Doc Req 1): Create the initial Class Diagram, starting with the `Users` table.
    4.  Backend (API):
        * (Req 2) Register Endpoint: `POST /api/auth/register` (Validate email, password rules: 8+ chars, 1 uppercase, 1 number).
        * (Req 3) Login Endpoint: `POST /api/auth/login` (Implement JWT for session management).
        * (Req 3) Logout Endpoint: `POST /api/auth/logout`.
        * (Req 4) Delete Account Endpoint: `DELETE /api/users/me` (Ensure this cascades to delete user's data - Req 11, 13, 14).
    5.  Frontend:
        * Create Registration and Login pages.
        * Implement client-side routing (e.g., React Router).
        * Create a basic Profile page where a user can delete their account.
    6.  Testing (Test Req 1-4):
        * Write unit tests for Register, Login, Logout, and Delete Account endpoints. Include positive (success) and negative (failure, e.g., bad password) tests.
    7.  Documentation (Doc Req 3, 4):
        * Start the REST API documentation (e.g., using Swagger or a Markdown file).
        * Set up the project backlog (e.g., Trello, Jira, GitHub Projects) (Doc Req 4).

Phase 2: Core Movie Functionality (TMDb Integration)
* Goal: Integrate the TMDb API to fetch and display movie data. All features in this phase are public (no login required).
* Key Tasks:
    1.  API Setup: Register for a TMDb API key (from [developer.themoviedb.org](https://developer.themoviedb.org/reference/intro/getting-started)). Create a secure proxy on the Node.js backend to handle API requests (to protect your private key).
    2.  Backend (API):
        * (Req 5) Search Endpoint: `GET /api/movies/search` (Support at least 3 criteria, e.g., `?query=...`, `?genre=...`, `?year=...`).
        * (Req 6) Now Playing Endpoint: `GET /api/movies/now-playing` (Fetch from TMDb, specifying `region=FI` for Finland).
    3.  Frontend:
        * (Req 5) Search Page: Build a search bar and results display.
        * (Req 6) "Now in Theaters" Page: Display a grid/list of current movies.
        * Movie Detail Page: Create a component to show detailed info when a user clicks a movie.
    4.  Responsiveness (Req 1): Begin implementing a responsive layout (e.g., using CSS Grid/Flexbox) that scales from mobile to desktop.
    5.  Documentation (Doc Req 2): Create the UI/UX plan (wireframes) for the search results and movie detail pages.

Phase 3: User Interaction (Reviews & Favorites)
* Goal: Allow logged-in users to create personal content (reviews and favorite lists).
* Key Tasks:
    1.  Database Design (Doc Req 1): Update the Class Diagram to include `Reviews` and `FavoriteLists` tables, with relationships to the `Users` table.
    2.  Backend (API):
        * (Req 11) Add Review Endpoint: `POST /api/reviews`.
        * (Req 12) Get Reviews Endpoint: `GET /api/reviews` (for all) and `GET /api/movies/:id/reviews` (for one movie).
        * (Req 13) Favorite List Endpoints: `POST /api/users/me/favorites`, `GET /api/users/me/favorites`, `DELETE /api/users/me/favorites/:movieId`.
        * (Req 14) Shareable List Endpoint: `GET /api/favorites/share/:userId` (Creates a public-safe view of a user's list).
    3.  Frontend:
        * (Req 11) Review Form: Add a form (text, 1-5 star rating) to the Movie Detail page (for logged-in users).
        * (Req 12) Review Display: Display all reviews on the Movie Detail page (showing user email, timestamp).
        * (Req 13) Profile Page: Enhance the Profile page to show the user's private "My Favorites" list.
        * (Req 14) Share Button: Add a "Share" button on the profile that generates the shareable URL.
    4.  Testing (Test Req 5): Write unit tests for the "Browse Reviews" (GET) endpoint.

Phase 4: Social Features (Groups)
* Goal: Implement the complex group and membership functionality.
* Key Tasks:
    1.  Database Design (Doc Req 1): Finalize the Class Diagram. Add `Groups`, `GroupMembers` (with roles like 'owner', 'member'), `JoinRequests`, and `GroupContent` (linking groups to movies).
    2.  Backend (API):
        * (Req 7) Group Endpoints: `POST /api/groups` (Create), `GET /api/groups` (List), `GET /api/groups/:id` (Details - check membership), `DELETE /api/groups/:id` (Owner only).
        * (Req 8) Membership Request Endpoints: `POST /api/groups/:id/join` (Send request), `POST /api/groups/:id/requests` (Owner approve/deny).
        * (Req 9) Membership Removal Endpoints: `DELETE /api/groups/:id/members/:userId` (Owner removes), `DELETE /api/groups/:id/leave` (User leaves).
        * (Req 10) Group Content Endpoint: `POST /api/groups/:id/movies` (Add movie/showtime to group).
    3.  Frontend:
        * (Req 7) Groups List Page: Show all groups, allow creation of a new group.
        * (Req 7) Single Group Page: Show group details. Content is visible *only* to members.
        * (Req 8, 9) Membership UI: Implement "Join" button, "Manage Requests" panel (for owner), "Leave Group" button, and "Remove Member" (for owner).
        * (Req 10) Group Customization: Allow members to add movies (from search) to the group page.

Phase 5: Finalization & Deployment
* Goal: Complete the project, add a custom feature, ensure full responsiveness, and deploy.
* Key Tasks:
    1.  (Req 15) Optional Feature: Implement one self-defined feature (e.g., a "Watchlist", "Friends" system, or "Recommended Movies").
    2.  (Req 1) Responsiveness: Conduct a final review of all pages on mobile, tablet, and desktop viewports to ensure the UI scales properly.
    3.  (Req 16) Deployment:
        * Deploy the PostgreSQL database (e.g., Railway, Supabase, Neon).
        * Deploy the Node.js backend (e.g., Render, Railway).
        * Deploy the React frontend (e.g., Netlify, Vercel).
    4.  Documentation (Doc Req 1-6): Finalize all documentation (DB Diagram, UI Plan, REST Docs, Backlog, Version Control usage summary).

---

Documentation & Management

* (Doc Req 1) Class Diagram: To be created using Lucidchart or draw.io and updated at each phase.
* (Doc Req 2) UI Plan: Wireframes to be created in Figma or Excalidraw before building components.
* (Doc Req 3) REST Documentation: Will be maintained in `API_DOCS.md` or using Swagger/OpenAPI.
* (Doc Req 4) Backlog Management: Will be managed using GitHub Projects or Trello.
* (Doc Req 5) Version Control: Git will be used following a `main` -> `develop` -> `feature-branch` workflow.
* (Doc Req 6) Project Management: Adherence to the project plan and active participation (if team-based).

---

Getting Started (Setup)

Prerequisites

* Node.js (v18 or later)
* PostgreSQL
* A TMDb API Key. Get one from [developer.themoviedb.org](https://developer.themoviedb.org/reference/intro/getting-started)

Installation & Running

1.  Clone the repository:
    ```bash
    git clone [your-repo-url]
    cd [your-repo-name]
    ```

2.  Backend Setup (in `/server` or `/backend` folder):
    ```bash
    cd server
    npm install
    # Create a .env file and add DB_HOST, DB_USER, DB_PASS, JWT_SECRET, TMDB_API_KEY
    npm run dev 
    ```

3.  Frontend Setup (in `/client` or `/frontend` folder):
    ```bash
    cd client
    npm install
    npm start
    ```

---

UI Plan: https://stitch.withgoogle.com/projects/5959244375673120853

DataModel: https://drive.google.com/file/d/1bSeaG59YCrL8optfts97AZ1po0do8vY4/view?usp=sharing