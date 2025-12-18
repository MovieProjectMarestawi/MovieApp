
# Database Viewing Guide

This guide explains how to view the project database using pgAdmin and how to demonstrate it to an instructor.

## Accessing pgAdmin

1. Open in your browser: http://localhost:5050
2. Sign in:
   - Email: admin@movieapp.com
   - Password: admin

## Connecting to the Database

### First-time Connection

1. After pgAdmin opens, you will see "Servers" in the left panel.
2. Right-click "Servers" > "Register" > "Server..."
3. **General tab:**
   - Name: MovieApp DB
4. **Connection tab:**
   - Host name/address: postgres (important: not localhost)
   - Port: 5432
   - Maintenance database: moviehub
   - Username: postgres
   - Password: the `DB_PASS` value from the `.env` file (default: 465546)
5. Click the "Save" button.

### Subsequent Connections

- Click the "MovieApp DB" server in the left panel.
- If prompted for a password, enter the `DB_PASS` value from the `.env` file.

## Viewing the Database Structure

### Viewing Tables

1. In the left panel, navigate the following path:
   ```
   Servers
   └── MovieApp DB
       └── Databases
           └── moviehub
               └── Schemas
                   └── public
                       └── Tables
   ```

2. The Tables folder shows all tables, including:
   - `users` — Users
   - `reviews` — Movie reviews
   - `favorites` — Favorite movies
   - `groups` — Groups
   - `group_members` — Group members
   - `join_requests` — Join requests
   - `group_content` — Group content (movies)

### Viewing Table Data

1. Right-click the table you want to inspect.
2. Select "View/Edit Data" > "All Rows".
3. All records in the table will be displayed.

### Viewing Table Schema

1. Right-click the table.
2. Choose "Properties".
3. The "Columns" tab lists all columns and their types.

## Running SQL Queries

### Using the Query Tool

1. Right-click the `moviehub` database in the left panel.
2. Select "Query Tool".
3. Enter your SQL query.
4. Execute with F5 or the Run (▶️) button.

### Example Queries

```sql
-- List all users
SELECT * FROM users;

-- Total number of users
SELECT COUNT(*) AS total_users FROM users;

-- List all groups
SELECT * FROM groups;

-- Total number of groups
SELECT COUNT(*) AS total_groups FROM groups;

-- List all reviews
SELECT * FROM reviews;

-- Users with the most reviews
SELECT u.email, COUNT(r.id) AS review_count
FROM users u
LEFT JOIN reviews r ON u.id = r.user_id
GROUP BY u.id, u.email
ORDER BY review_count DESC;

-- Total favorites
SELECT COUNT(*) AS total_favorites FROM favorites;

-- Group member counts
SELECT g.name, COUNT(gm.id) AS member_count
FROM groups g
LEFT JOIN group_members gm ON g.id = gm.group_id
GROUP BY g.id, g.name
ORDER BY member_count DESC;

-- Pending join requests
SELECT * FROM join_requests WHERE status = 'pending';
```

## Visualizing Database Relationships

1. Right-click the `moviehub` database in the left panel.
2. Choose the ERD Tool (Entity Relationship Diagram).
3. The tool will display tables and their relationships visually.

## Tips for Demonstrating to an Instructor

### 1. Show Table Schemas
- Display each table's columns and data types.
- Explain foreign key relationships.

### 2. Show Sample Data
- Show a few example records from each table.
- Mention that the data comes from real usage of the app.

### 3. Explain Relationships
- `users` → `reviews` (a user can have multiple reviews)
- `users` → `favorites` (a user can have multiple favorites)
- `groups` → `group_members` (a group can have many members)
- `groups` → `group_content` (a group can contain many movies)

### 4. Run SQL Queries
- Run simple SELECT queries.
- Demonstrate JOIN queries that combine related tables.
- Use COUNT, GROUP BY, and other aggregate functions.

### 5. Show the Database Model
- Use the ERD Tool for a visual schema overview.
- Refer to [docs/DATABASE_MODEL.md](docs/DATABASE_MODEL.md) for details.

## Quick Access Information

- **pgAdmin URL:** http://localhost:5050
- **pgAdmin Email:** admin@movieapp.com
- **pgAdmin Password:** admin
- **Database Host:** postgres (Docker container name)
- **Database Port:** 5432
- **Database Name:** moviehub
- **Database User:** postgres
- **Database Password:** the `DB_PASS` value from the `.env` file

## Notes

- The database is accessible if the Docker containers are running.
- If the pgAdmin container isn't running: `docker-compose up -d pgadmin`
- If the Postgres container isn't running: `docker-compose up -d postgres`
- To check all services: `docker-compose ps`

