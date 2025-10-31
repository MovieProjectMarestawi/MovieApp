# Database Model Documentation

## Entity Relationship Diagram

```
┌─────────────┐
│   users     │
├─────────────┤
│ id (PK)     │
│ email       │──┐
│ password    │  │
│ created_at  │  │
│ updated_at  │  │
└─────────────┘  │
                │
    ┌───────────┼───────────┬───────────────┬─────────────┐
    │           │           │               │             │
    │           │           │               │             │
┌───▼────────┐ ┌▼────────┐ ┌──────────┐ ┌─▼──────────┐ ┌▼──────────┐
│  reviews    │ │favorites│ │  groups  │ │group_     │ │join_      │
├─────────────┤ ├─────────┤ ├──────────┤ │members    │ │requests  │
│ id (PK)     │ │id (PK)  │ │ id (PK)  │ ├───────────┤ ├──────────┤
│ user_id(FK) │ │user_id  │ │ name     │ │ id (PK)   │ │ id (PK)   │
│ movie_id    │ │(FK)     │ │ desc     │ │ group_id  │ │ group_id  │
│ rating      │ │movie_id │ │ owner_id │ │(FK)       │ │(FK)       │
│ text        │ │         │ │(FK)      │ │ user_id   │ │ user_id   │
│ created_at  │ │         │ │created_at│ │(FK)       │ │(FK)       │
│ updated_at  │ │         │ │updated_at│ │ role      │ │ status    │
└─────────────┘ └─────────┘ └────┬─────┘ │ joined_at │ │           │
                                 │       └───────────┘ └───────────┘
                                 │
                                 │
                        ┌────────▼────────┐
                        │  group_content  │
                        ├─────────────────┤
                        │ id (PK)         │
                        │ group_id (FK)   │
                        │ movie_id        │
                        │ added_by (FK)   │
                        │ added_at        │
                        └─────────────────┘
```

## Table Relationships

### Users Table
- **Primary Key**: id
- **Relationships**:
  - One-to-Many with Reviews
  - One-to-Many with Favorites
  - One-to-Many with Groups (as owner)
  - One-to-Many with GroupMembers
  - One-to-Many with JoinRequests
  - One-to-Many with GroupContent (as added_by)

### Reviews Table
- **Primary Key**: id
- **Foreign Keys**: user_id → users(id)
- **Constraints**: 
  - Unique(user_id, movie_id) - One review per user per movie
  - Rating must be between 1-5
- **Cascade**: DELETE CASCADE (when user is deleted)

### Favorites Table
- **Primary Key**: id
- **Foreign Keys**: user_id → users(id)
- **Constraints**: 
  - Unique(user_id, movie_id) - One favorite per user per movie
- **Cascade**: DELETE CASCADE (when user is deleted)

### Groups Table
- **Primary Key**: id
- **Foreign Keys**: owner_id → users(id)
- **Cascade**: DELETE CASCADE (when owner is deleted)

### GroupMembers Table
- **Primary Key**: id
- **Foreign Keys**: 
  - group_id → groups(id)
  - user_id → users(id)
- **Constraints**: 
  - Unique(group_id, user_id) - One membership per user per group
  - Role must be 'owner' or 'member'
- **Cascade**: DELETE CASCADE (when group or user is deleted)

### JoinRequests Table
- **Primary Key**: id
- **Foreign Keys**: 
  - group_id → groups(id)
  - user_id → users(id)
- **Constraints**: 
  - Status must be 'pending', 'approved', or 'rejected'
  - Unique(group_id, user_id) - One request per user per group
- **Cascade**: DELETE CASCADE (when group or user is deleted)

### GroupContent Table
- **Primary Key**: id
- **Foreign Keys**: 
  - group_id → groups(id)
  - added_by → users(id)
- **Constraints**: 
  - Unique(group_id, movie_id) - One entry per movie per group
- **Cascade**: 
  - DELETE CASCADE when group is deleted
  - SET NULL when user (added_by) is deleted

## Notes

1. **Movie IDs**: All movie_id fields store TMDb movie IDs (integers), not local movie records
2. **Cascade Deletes**: When a user is deleted, all their reviews, favorites, groups (as owner), and group memberships are deleted
3. **Indexes**: Created on foreign keys and frequently queried columns for performance
4. **Timestamps**: Auto-updated with triggers
5. **Unique Constraints**: Prevent duplicate entries (e.g., one review per user per movie)

