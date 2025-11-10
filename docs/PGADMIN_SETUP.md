# Database Setup with pgAdmin 4

## Steps

### 1. Open pgAdmin 4

### 2. Create Database

1. Expand your PostgreSQL server in the left panel
2. Right-click on "Databases" → "Create" → "Database..."
3. Database name: `moviehub`
4. Owner: `postgres` (or your username)
5. Click "Save"

### 3. Run Schema.sql File

1. Right-click on the `moviehub` database you created
2. Select "Query Tool"
3. Copy the contents of `server/database/schema.sql` file and paste into Query Tool
4. Press "Execute" (F5) button or click the execute button

### 4. Verify

1. Expand the `moviehub` database in the left panel
2. Navigate to "Schemas" → "public" → "Tables" - you should see these tables:
   - users
   - reviews
   - favorites
   - groups
   - group_members
   - join_requests
   - group_content

## Important Notes

- The schema.sql file uses PostgreSQL standard SQL syntax
- pgAdmin 4's Query Tool can run this file directly
- All tables, indexes, and triggers will be created automatically
- If tables already exist, `CREATE TABLE IF NOT EXISTS` will prevent errors
