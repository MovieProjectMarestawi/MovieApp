# Database Schema

## Setup

1. Create PostgreSQL database:
```sql
CREATE DATABASE moviehub;
```

2. Run the schema:
```bash
psql -U postgres -d moviehub -f schema.sql
```

Or using connection string:
```bash
psql postgresql://username:password@localhost:5432/moviehub < schema.sql
```

## Database Structure

### Tables

1. **users** - User accounts (Phase 1)
   - id, email, password_hash, created_at, updated_at

2. **reviews** - Movie reviews (Phase 3)
   - id, user_id, movie_id (TMDb ID), rating (1-5), text, created_at, updated_at
   - One review per user per movie

3. **favorites** - User favorite movies (Phase 3)
   - id, user_id, movie_id (TMDb ID), created_at
   - One favorite entry per user per movie

4. **groups** - Movie groups (Phase 4)
   - id, name, description, owner_id, created_at, updated_at

5. **group_members** - Group membership (Phase 4)
   - id, group_id, user_id, role ('owner', 'member'), joined_at
   - One membership per user per group

6. **join_requests** - Group join requests (Phase 4)
   - id, group_id, user_id, status ('pending', 'approved', 'rejected'), requested_at, responded_at

7. **group_content** - Movies in groups (Phase 4)
   - id, group_id, movie_id (TMDb ID), added_by, added_at
   - One entry per movie per group

## Notes

- Movie IDs are TMDb movie IDs (integers), not stored in a local movies table
- All foreign keys have CASCADE DELETE except group_content.added_by (SET NULL)
- Unique constraints prevent duplicate entries
- Indexes are created for faster queries
- Auto-update triggers for updated_at columns

