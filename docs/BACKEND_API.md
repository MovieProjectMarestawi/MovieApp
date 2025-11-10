# The Movie Hub - Backend API Documentation

**Frontend Developer Guide**

This documentation is prepared for frontend developers to integrate the backend API.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Base URL & Environment](#base-url--environment)
3. [Authentication](#authentication)
4. [API Endpoints](#api-endpoints)
5. [Error Handling](#error-handling)
6. [Code Examples](#code-examples)
7. [Common Patterns](#common-patterns)

---

## 🚀 Quick Start

### 1. Base URL
```javascript
const API_BASE_URL = 'http://localhost:5000/api';
// Production: 'https://your-backend-url.com/api'
```

### 2. Authentication Setup
```javascript
// Save token to localStorage
localStorage.setItem('token', token);

// Add token to header in every request
const token = localStorage.getItem('token');
headers: {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
}
```

### 3. API Service Example
```javascript
// api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const api = {
  get: async (endpoint, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });
    
    return handleResponse(response);
  },
  
  post: async (endpoint, data, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
  
  put: async (endpoint, data, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    
    return handleResponse(response);
  },
  
  delete: async (endpoint, token = null) => {
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });
    
    return handleResponse(response);
  },
};

const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};
```

---

## 🌐 Base URL & Environment

### Development
```
http://localhost:5000/api
```

### Production
```
https://your-backend-url.com/api
```

### Environment Variables (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

---

## 🔐 Authentication

### Token Management

**Save Token:**
```javascript
// After Login/Register
const { token } = response.data;
localStorage.setItem('token', token);
```

**Use Token:**
```javascript
const token = localStorage.getItem('token');
```

**Remove Token:**
```javascript
// Logout
localStorage.removeItem('token');
```

**Check Token:**
```javascript
const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return token !== null && token !== undefined;
};
```

---

## 📡 API Endpoints

### 🔑 Authentication Endpoints

#### Register User
```javascript
POST /api/auth/register

// Request
{
  "email": "user@example.com",
  "password": "Password123"
}

// Response (201)
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2025-01-17T10:00:00.000Z"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Usage Example
const register = async (email, password) => {
  const response = await api.post('/auth/register', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 number

**Error Codes:**
- `400` - Validation error
- `409` - User already exists

---

#### Login
```javascript
POST /api/auth/login

// Request
{
  "email": "user@example.com",
  "password": "Password123"
}

// Response (200)
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}

// Usage Example
const login = async (email, password) => {
  const response = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', response.data.token);
  return response.data.user;
};
```

**Error Codes:**
- `400` - Missing required fields
- `401` - Invalid email or password

---

#### Logout
```javascript
POST /api/auth/logout

// Response (200)
{
  "success": true,
  "message": "Logout successful"
}

// Usage Example
const logout = async () => {
  const token = localStorage.getItem('token');
  await api.post('/auth/logout', {}, token);
  localStorage.removeItem('token');
};
```

---

### 👤 User Endpoints

#### Get User Profile
```javascript
GET /api/users/me
// Requires: Authentication

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "created_at": "2025-01-17T10:00:00.000Z"
    }
  }
}

// Usage Example
const getProfile = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/users/me', token);
  return response.data.user;
};
```

---

#### Delete Account
```javascript
DELETE /api/users/me
// Requires: Authentication

// Response (200)
{
  "success": true,
  "message": "Account deleted successfully"
}

// Usage Example
const deleteAccount = async () => {
  const token = localStorage.getItem('token');
  await api.delete('/users/me', token);
  localStorage.removeItem('token');
};
```

---

### 🎬 Movie Endpoints

#### Search Movies
```javascript
GET /api/movies/search?query=matrix&genre=28&year=1999&page=1
// Public endpoint

// Query Parameters:
// - query (string, optional) - Movie title
// - genre (number, optional) - Genre ID
// - year (number, optional) - Release year
// - page (number, optional, default: 1) - Page number

// Response (200)
{
  "success": true,
  "data": {
    "page": 1,
    "results": [
      {
        "id": 603,
        "title": "The Matrix",
        "overview": "Set in the 22nd century...",
        "poster_path": "https://image.tmdb.org/t/p/w500/...",
        "backdrop_path": "https://image.tmdb.org/t/p/w500/...",
        "release_date": "1999-03-31",
        "vote_average": 8.234,
        "vote_count": 26959
      }
    ],
    "total_pages": 5,
    "total_results": 91
  }
}

// Usage Example
const searchMovies = async (query, genre, year, page = 1) => {
  const params = new URLSearchParams();
  if (query) params.append('query', query);
  if (genre) params.append('genre', genre);
  if (year) params.append('year', year);
  params.append('page', page);
  
  const response = await api.get(`/movies/search?${params.toString()}`);
  return response.data;
};
```

**Note:** At least one search criteria is required (query, genre, or year)

---

#### Get Now Playing Movies
```javascript
GET /api/movies/now-playing?region=FI&page=1
// Public endpoint

// Query Parameters:
// - region (string, optional, default: FI) - Region code
// - page (number, optional, default: 1) - Page number

// Response (200)
{
  "success": true,
  "data": {
    "page": 1,
    "results": [...],
    "total_pages": 10,
    "total_results": 200
  }
}

// Usage Example
const getNowPlaying = async (region = 'FI', page = 1) => {
  const response = await api.get(`/movies/now-playing?region=${region}&page=${page}`);
  return response.data;
};
```

---

#### Get Movie Details
```javascript
GET /api/movies/:id
// Public endpoint

// Response (200)
{
  "success": true,
  "data": {
    "id": 603,
    "title": "The Matrix",
    "overview": "...",
    "poster_path": "https://...",
    "backdrop_path": "https://...",
    "release_date": "1999-03-31",
    "runtime": 136,
    "genres": [...],
    "vote_average": 8.234,
    "vote_count": 26959,
    // ... more fields
  }
}

// Usage Example
const getMovieDetails = async (movieId) => {
  const response = await api.get(`/movies/${movieId}`);
  return response.data;
};
```

---

#### Get Movie Genres
```javascript
GET /api/movies/genres
// Public endpoint

// Response (200)
{
  "success": true,
  "data": {
    "genres": [
      {
        "id": 28,
        "name": "Action"
      },
      {
        "id": 12,
        "name": "Adventure"
      }
      // ... more genres
    ]
  }
}

// Usage Example
const getGenres = async () => {
  const response = await api.get('/movies/genres');
  return response.data.genres;
};
```

---

#### Get Movie Reviews
```javascript
GET /api/movies/:id/reviews?page=1&limit=20
// Public endpoint

// Response (200)
{
  "success": true,
  "data": {
    "reviews": [
      {
        "id": 1,
        "user_id": 1,
        "movie_id": 603,
        "rating": 5,
        "text": "Amazing movie!",
        "created_at": "2025-01-17T10:00:00.000Z",
        "updated_at": "2025-01-17T10:00:00.000Z",
        "user_email": "user@example.com"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}

// Usage Example
const getMovieReviews = async (movieId, page = 1, limit = 20) => {
  const response = await api.get(`/movies/${movieId}/reviews?page=${page}&limit=${limit}`);
  return response.data;
};
```

---

### ⭐ Review Endpoints

#### Create Review
```javascript
POST /api/reviews
// Requires: Authentication

// Request
{
  "movie_id": 603,
  "rating": 5,
  "text": "Amazing movie! Highly recommended."
}

// Response (201)
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "review": {
      "id": 1,
      "user_id": 1,
      "movie_id": 603,
      "rating": 5,
      "text": "Amazing movie! Highly recommended.",
      "created_at": "2025-01-17T10:00:00.000Z"
    }
  }
}

// Usage Example
const createReview = async (movieId, rating, text) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/reviews', {
    movie_id: movieId,
    rating,
    text
  }, token);
  return response.data.review;
};
```

**Validation:**
- `rating`: Number between 1-5 (required)
- `text`: Non-empty string (required)
- `movie_id`: Positive number (required)

**Error Codes:**
- `400` - Validation error
- `401` - Authentication required
- `409` - Review already exists (update instead)

---

#### Get All Reviews
```javascript
GET /api/reviews?movie_id=603&page=1&limit=20
// Public endpoint

// Query Parameters:
// - movie_id (number, optional) - Filter by movie
// - page (number, optional, default: 1)
// - limit (number, optional, default: 20)

// Response (200)
{
  "success": true,
  "data": {
    "reviews": [...],
    "pagination": {...}
  }
}

// Usage Example
const getAllReviews = async (movieId = null, page = 1, limit = 20) => {
  const params = new URLSearchParams();
  if (movieId) params.append('movie_id', movieId);
  params.append('page', page);
  params.append('limit', limit);
  
  const response = await api.get(`/reviews?${params.toString()}`);
  return response.data;
};
```

---

#### Update Review
```javascript
PUT /api/reviews/:id
// Requires: Authentication (own review only)

// Request
{
  "rating": 4,
  "text": "Updated review text"
}

// Response (200)
{
  "success": true,
  "message": "Review updated successfully",
  "data": {
    "review": {...}
  }
}

// Usage Example
const updateReview = async (reviewId, rating, text) => {
  const token = localStorage.getItem('token');
  const response = await api.put(`/reviews/${reviewId}`, {
    rating,
    text
  }, token);
  return response.data.review;
};
```

**Error Codes:**
- `403` - Not your review
- `404` - Review not found

---

#### Delete Review
```javascript
DELETE /api/reviews/:id
// Requires: Authentication (own review only)

// Response (200)
{
  "success": true,
  "message": "Review deleted successfully"
}

// Usage Example
const deleteReview = async (reviewId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/reviews/${reviewId}`, token);
};
```

---

### ❤️ Favorites Endpoints

#### Add to Favorites
```javascript
POST /api/users/me/favorites
// Requires: Authentication

// Request
{
  "movie_id": 603
}

// Response (201)
{
  "success": true,
  "message": "Movie added to favorites successfully",
  "data": {
    "favorite": {
      "id": 1,
      "user_id": 1,
      "movie_id": 603,
      "created_at": "2025-01-17T10:00:00.000Z"
    }
  }
}

// Usage Example
const addFavorite = async (movieId) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/users/me/favorites', {
    movie_id: movieId
  }, token);
  return response.data.favorite;
};
```

**Error Codes:**
- `409` - Movie already in favorites

---

#### Get Favorites
```javascript
GET /api/users/me/favorites
// Requires: Authentication

// Response (200)
{
  "success": true,
  "data": {
    "favorites": [
      {
        "id": 1,
        "user_id": 1,
        "movie_id": 603,
        "created_at": "2025-01-17T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}

// Usage Example
const getFavorites = async () => {
  const token = localStorage.getItem('token');
  const response = await api.get('/users/me/favorites', token);
  return response.data.favorites;
};
```

---

#### Remove from Favorites
```javascript
DELETE /api/users/me/favorites/:movieId
// Requires: Authentication

// Response (200)
{
  "success": true,
  "message": "Movie removed from favorites successfully"
}

// Usage Example
const removeFavorite = async (movieId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/users/me/favorites/${movieId}`, token);
};
```

---

#### Get Shareable Favorites
```javascript
GET /api/favorites/share/:userId
// Public endpoint

// Response (200)
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com"
    },
    "favorites": [
      {
        "movie_id": 603,
        "added_at": "2025-01-17T10:00:00.000Z"
      }
    ],
    "count": 1
  }
}

// Usage Example
const getShareableFavorites = async (userId) => {
  const response = await api.get(`/favorites/share/${userId}`);
  return response.data;
};
```

---

### 👥 Groups Endpoints

#### Create Group
```javascript
POST /api/groups
// Requires: Authentication

// Request
{
  "name": "Action Movie Lovers",
  "description": "A group for action movie enthusiasts"
}

// Response (201)
{
  "success": true,
  "message": "Group created successfully",
  "data": {
    "group": {
      "id": 1,
      "name": "Action Movie Lovers",
      "description": "A group for action movie enthusiasts",
      "owner_id": 1,
      "created_at": "2025-01-17T10:00:00.000Z"
    }
  }
}

// Usage Example
const createGroup = async (name, description) => {
  const token = localStorage.getItem('token');
  const response = await api.post('/groups', {
    name,
    description
  }, token);
  return response.data.group;
};
```

**Validation:**
- `name`: Max 255 characters (required)
- `description`: Max 1000 characters (optional)

---

#### List All Groups
```javascript
GET /api/groups?page=1&limit=20
// Public endpoint

// Response (200)
{
  "success": true,
  "data": {
    "groups": [
      {
        "id": 1,
        "name": "Action Movie Lovers",
        "description": "...",
        "owner_id": 1,
        "owner_email": "owner@example.com",
        "member_count": 5,
        "created_at": "2025-01-17T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 10,
      "totalPages": 1
    }
  }
}

// Usage Example
const listGroups = async (page = 1, limit = 20) => {
  const response = await api.get(`/groups?page=${page}&limit=${limit}`);
  return response.data;
};
```

---

#### Get Group Details
```javascript
GET /api/groups/:id
// Public endpoint (content only visible to members)

// Response (200)
{
  "success": true,
  "data": {
    "group": {
      "id": 1,
      "name": "Action Movie Lovers",
      "description": "...",
      "owner_id": 1,
      "member_count": 5,
      "members": [...],
      "content": null,  // Only visible to members
      "is_member": false,
      "is_owner": false
    }
  }
}

// Usage Example
const getGroupDetails = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/groups/${groupId}`, token);
  return response.data.group;
};
```

---

#### Request to Join Group
```javascript
POST /api/groups/:id/join
// Requires: Authentication

// Response (201)
{
  "success": true,
  "message": "Join request sent successfully",
  "data": {
    "join_request": {
      "id": 1,
      "group_id": 1,
      "user_id": 2,
      "status": "pending",
      "requested_at": "2025-01-17T10:00:00.000Z"
    }
  }
}

// Usage Example
const joinGroup = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/groups/${groupId}/join`, {}, token);
  return response.data.join_request;
};
```

---

#### Get Join Requests (Owner Only)
```javascript
GET /api/groups/:id/requests
// Requires: Authentication (owner only)

// Response (200)
{
  "success": true,
  "data": {
    "requests": [
      {
        "id": 1,
        "group_id": 1,
        "user_id": 2,
        "status": "pending",
        "requested_at": "2025-01-17T10:00:00.000Z",
        "user_email": "user@example.com"
      }
    ]
  }
}

// Usage Example
const getJoinRequests = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/groups/${groupId}/requests`, token);
  return response.data.requests;
};
```

---

#### Approve Join Request
```javascript
POST /api/groups/:id/requests/:requestId/approve
// Requires: Authentication (owner only)

// Response (200)
{
  "success": true,
  "message": "Join request approved successfully"
}

// Usage Example
const approveJoinRequest = async (groupId, requestId) => {
  const token = localStorage.getItem('token');
  await api.post(`/groups/${groupId}/requests/${requestId}/approve`, {}, token);
};
```

---

#### Reject Join Request
```javascript
POST /api/groups/:id/requests/:requestId/reject
// Requires: Authentication (owner only)

// Response (200)
{
  "success": true,
  "message": "Join request rejected successfully"
}

// Usage Example
const rejectJoinRequest = async (groupId, requestId) => {
  const token = localStorage.getItem('token');
  await api.post(`/groups/${groupId}/requests/${requestId}/reject`, {}, token);
};
```

---

#### Add Movie to Group
```javascript
POST /api/groups/:id/movies
// Requires: Authentication (member only)

// Request
{
  "movie_id": 603
}

// Response (201)
{
  "success": true,
  "message": "Movie added to group successfully",
  "data": {
    "content": {
      "id": 1,
      "group_id": 1,
      "movie_id": 603,
      "added_by": 2,
      "added_at": "2025-01-17T10:00:00.000Z"
    }
  }
}

// Usage Example
const addMovieToGroup = async (groupId, movieId) => {
  const token = localStorage.getItem('token');
  const response = await api.post(`/groups/${groupId}/movies`, {
    movie_id: movieId
  }, token);
  return response.data.content;
};
```

---

#### Get Group Movies
```javascript
GET /api/groups/:id/movies
// Requires: Authentication (member only)

// Response (200)
{
  "success": true,
  "data": {
    "movies": [
      {
        "id": 1,
        "movie_id": 603,
        "added_at": "2025-01-17T10:00:00.000Z",
        "added_by": 2,
        "added_by_email": "member@example.com"
      }
    ]
  }
}

// Usage Example
const getGroupMovies = async (groupId) => {
  const token = localStorage.getItem('token');
  const response = await api.get(`/groups/${groupId}/movies`, token);
  return response.data.movies;
};
```

---

#### Remove Movie from Group
```javascript
DELETE /api/groups/:id/movies/:movieId
// Requires: Authentication (member only)

// Response (200)
{
  "success": true,
  "message": "Movie removed from group successfully"
}

// Usage Example
const removeMovieFromGroup = async (groupId, movieId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/groups/${groupId}/movies/${movieId}`, token);
};
```

---

#### Leave Group
```javascript
DELETE /api/groups/:id/leave
// Requires: Authentication (member only, not owner)

// Response (200)
{
  "success": true,
  "message": "Left group successfully"
}

// Usage Example
const leaveGroup = async (groupId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/groups/${groupId}/leave`, token);
};
```

---

#### Delete Group
```javascript
DELETE /api/groups/:id
// Requires: Authentication (owner only)

// Response (200)
{
  "success": true,
  "message": "Group deleted successfully"
}

// Usage Example
const deleteGroup = async (groupId) => {
  const token = localStorage.getItem('token');
  await api.delete(`/groups/${groupId}`, token);
};
```

---

## ⚠️ Error Handling

### Standard Error Response Format
```javascript
{
  "success": false,
  "message": "Error message here"
}
```

### HTTP Status Codes

| Code | Meaning | Common Causes |
|------|---------|---------------|
| 200 | Success | Request successful |
| 201 | Created | Resource created successfully |
| 400 | Bad Request | Validation error, missing fields |
| 401 | Unauthorized | Missing or invalid token |
| 403 | Forbidden | Not authorized (not owner/member) |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Resource already exists |
| 500 | Server Error | Internal server error |

### Error Handling Example
```javascript
try {
  const response = await api.post('/auth/login', { email, password });
  // Success
  return response.data;
} catch (error) {
  // Handle error
  if (error.message.includes('401')) {
    // Invalid credentials
    alert('Invalid email or password');
  } else if (error.message.includes('400')) {
    // Validation error
    alert(error.message);
  } else {
    // Other errors
    alert('An error occurred. Please try again.');
  }
  throw error;
}
```

### Global Error Handler (React)
```javascript
// utils/api.js
const handleResponse = async (response) => {
  const data = await response.json();
  
  if (!response.ok) {
    // Handle specific error codes
    if (response.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    
    throw new Error(data.message || 'An error occurred');
  }
  
  return data;
};
```

---

## 💡 Code Examples

### React Hook Example
```javascript
// hooks/useAuth.js
import { useState, useEffect } from 'react';
import { api } from '../utils/api';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    if (token) {
      api.get('/users/me', token)
        .then(response => {
          setUser(response.data.user);
        })
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    localStorage.setItem('token', response.data.token);
    setUser(response.data.user);
    return response.data.user;
  };

  const logout = async () => {
    const token = localStorage.getItem('token');
    if (token) {
      await api.post('/auth/logout', {}, token);
    }
    localStorage.removeItem('token');
    setUser(null);
  };

  return { user, loading, login, logout };
};
```

### Movie Search Component Example
```javascript
// components/MovieSearch.jsx
import { useState } from 'react';
import { api } from '../utils/api';

const MovieSearch = () => {
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;
    
    setLoading(true);
    try {
      const response = await api.get(`/movies/search?query=${encodeURIComponent(query)}`);
      setMovies(response.data.results);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search movies..."
      />
      <button onClick={handleSearch} disabled={loading}>
        {loading ? 'Searching...' : 'Search'}
      </button>
      
      <div>
        {movies.map(movie => (
          <div key={movie.id}>
            <h3>{movie.title}</h3>
            <p>{movie.overview}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
```

---

## 🔄 Common Patterns

### 1. Protected Routes
```javascript
// utils/ProtectedRoute.jsx
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return children;
};
```

### 2. API Interceptor (Axios Alternative)
```javascript
// utils/api.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const request = async (endpoint, options = {}) => {
  const token = localStorage.getItem('token');
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    throw new Error(data.message || 'An error occurred');
  }

  return data;
};
```

### 3. Form Submission Pattern
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  try {
    setLoading(true);
    const response = await api.post('/endpoint', formData, token);
    // Success handling
    alert('Success!');
  } catch (error) {
    // Error handling
    alert(error.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 📝 Notes

1. **Token Expiration:** JWT tokens are valid for 7 days. When the token expires, the user must login again.

2. **Pagination:** List endpoints use pagination. Control with `page` and `limit` parameters.

3. **Image URLs:** Poster and backdrop paths from TMDb are returned as full URLs.

4. **CORS:** Backend CORS is enabled. Frontend can run on a different port.

5. **Rate Limiting:** TMDb API rate limiting is applied. Too many requests should not be sent.

---

## 🆘 Support

For questions:
- Contact the Backend Developer
- You can use Postman to test API endpoints
- Use Browser DevTools Network tab to inspect requests/responses

---

**Last Updated:** 2025-01-17
**Backend Version:** 1.0.0
