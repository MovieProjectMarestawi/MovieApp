# REST API Documentation - Movie4you

## 📋 Proje Gereksinimi

**Rest-dokumentaatio (esim. Postman)**

REST dokümantasyonu (örneğin Postman)

## 🌐 Base URL

```
http://localhost:5001/api
```

## 🔐 Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <token>
```

## 📚 API Endpoints

### Authentication

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

#### Logout
```http
POST /api/auth/logout
```

**Response:**
```json
{
  "message": "Logout successful"
}
```

---

### Users

#### Get Current User Profile
```http
GET /api/users/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com",
    "created_at": "2025-01-17T10:00:00.000Z"
  }
}
```

#### Update Profile
```http
PUT /api/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "email": "newemail@example.com"
}
```

#### Change Password
```http
PUT /api/users/me/password
Authorization: Bearer <token>
Content-Type: application/json

{
  "current_password": "oldpassword",
  "new_password": "newpassword123"
}
```

#### Delete Account
```http
DELETE /api/users/me
Authorization: Bearer <token>
```

---

### Movies

#### Search Movies
```http
GET /api/movies/search?query=batman&genre=28&year=2020&page=1
```

**Query Parameters:**
- `query` (optional): Search query
- `genre` (optional): Genre ID
- `year` (optional): Release year
- `page` (optional): Page number (default: 1)

**Response:**
```json
{
  "results": [...],
  "page": 1,
  "total_pages": 10,
  "total_results": 200
}
```

#### Get Popular Movies
```http
GET /api/movies/popular?page=1
```

#### Discover Movies
```http
GET /api/movies/discover?page=1&genre=28&year=2020&sort_by=popularity.desc
```

#### Get Now Playing
```http
GET /api/movies/now-playing?region=FI&page=1
```

#### Get Movie Details
```http
GET /api/movies/:id
```

**Response:**
```json
{
  "id": 550,
  "title": "Fight Club",
  "overview": "...",
  "release_date": "1999-10-15",
  "poster_path": "/...",
  "backdrop_path": "/...",
  "vote_average": 8.4,
  "genres": [...],
  "runtime": 139
}
```

#### Get Movie Genres
```http
GET /api/movies/genres
```

**Response:**
```json
{
  "genres": [
    {"id": 28, "name": "Action"},
    {"id": 35, "name": "Comedy"},
    ...
  ]
}
```

#### Get Movie Reviews
```http
GET /api/movies/:id/reviews?page=1&limit=20
```

---

### Reviews

#### Create Review
```http
POST /api/reviews
Authorization: Bearer <token>
Content-Type: application/json

{
  "movie_id": 550,
  "rating": 5,
  "text": "Great movie!"
}
```

**Response:**
```json
{
  "review": {
    "id": 1,
    "user_id": 1,
    "movie_id": 550,
    "rating": 5,
    "text": "Great movie!",
    "created_at": "2025-01-17T10:00:00.000Z"
  }
}
```

#### Get All Reviews
```http
GET /api/reviews?page=1&limit=20
```

#### Update Review
```http
PUT /api/reviews/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 4,
  "text": "Updated review text"
}
```

#### Delete Review
```http
DELETE /api/reviews/:id
Authorization: Bearer <token>
```

---

### Favorites

#### Add to Favorites
```http
POST /api/users/me/favorites
Authorization: Bearer <token>
Content-Type: application/json

{
  "movie_id": 550
}
```

#### Get Favorites
```http
GET /api/users/me/favorites
Authorization: Bearer <token>
```

**Response:**
```json
{
  "favorites": [
    {
      "id": 1,
      "movie_id": 550,
      "movie": {
        "id": 550,
        "title": "Fight Club",
        ...
      }
    },
    ...
  ]
}
```

#### Remove from Favorites
```http
DELETE /api/users/me/favorites/:movieId
Authorization: Bearer <token>
```

#### Get Shareable Favorites
```http
GET /api/favorites/share/:userId
```

---

### Groups

#### Create Group
```http
POST /api/groups
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Action Movies",
  "description": "Group for action movie lovers"
}
```

**Response:**
```json
{
  "group": {
    "id": 1,
    "name": "Action Movies",
    "description": "Group for action movie lovers",
    "owner_id": 1,
    "created_at": "2025-01-17T10:00:00.000Z"
  }
}
```

#### List Groups
```http
GET /api/groups?page=1&limit=20
Authorization: Bearer <token> (optional)
```

#### Get Group Details
```http
GET /api/groups/:id
Authorization: Bearer <token> (optional)
```

#### Update Group
```http
PUT /api/groups/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Updated Name",
  "description": "Updated description"
}
```

#### Request to Join Group
```http
POST /api/groups/:id/join
Authorization: Bearer <token>
```

#### Get Join Requests
```http
GET /api/groups/:id/requests
Authorization: Bearer <token> (owner only)
```

#### Approve Join Request
```http
POST /api/groups/:id/requests/:requestId/approve
Authorization: Bearer <token> (owner only)
```

#### Reject Join Request
```http
POST /api/groups/:id/requests/:requestId/reject
Authorization: Bearer <token> (owner only)
```

#### Add Movie to Group
```http
POST /api/groups/:id/movies
Authorization: Bearer <token>
Content-Type: application/json

{
  "movie_id": 550
}
```

#### Get Group Movies
```http
GET /api/groups/:id/movies
Authorization: Bearer <token> (member only)
```

#### Remove Movie from Group
```http
DELETE /api/groups/:id/movies/:movieId
Authorization: Bearer <token> (owner only)
```

#### Remove Member from Group
```http
DELETE /api/groups/:id/members/:userId
Authorization: Bearer <token> (owner only)
```

#### Leave Group
```http
DELETE /api/groups/:id/leave
Authorization: Bearer <token> (member only, not owner)
```

#### Delete Group
```http
DELETE /api/groups/:id
Authorization: Bearer <token> (owner only)
```

#### Get All Pending Requests
```http
GET /api/groups/notifications/requests
Authorization: Bearer <token>
```

---

## 📦 Postman Collection

### Postman Collection Oluşturma

1. **Postman'i açın**
2. **"New" > "Collection" seçin**
3. **Collection adı:** "Movie4you API"
4. **Her endpoint için request ekleyin**

### Postman Environment

**Variables:**
- `base_url`: `http://localhost:5001/api`
- `token`: (JWT token - login sonrası otomatik set edilir)

### Postman Collection Export

1. **Collection'a sağ tıklayın**
2. **"Export" seçin**
3. **"Collection v2.1" formatını seçin**
4. **JSON dosyası olarak kaydedin**

### Postman Collection Link

Postman Collection'ı paylaşmak için:
1. **Postman'de "Share" butonuna tıklayın**
2. **"Get Public Link" seçin**
3. **Link'i kopyalayın**

## 📄 OpenAPI/Swagger (Alternatif)

### Swagger UI Kullanımı

1. **Swagger UI'yi yükleyin:**
   ```bash
   npm install swagger-ui-express swagger-jsdoc
   ```

2. **Swagger config oluşturun:**
   ```javascript
   const swaggerJsdoc = require('swagger-jsdoc');
   const swaggerUi = require('swagger-ui-express');

   const swaggerOptions = {
     definition: {
       openapi: '3.0.0',
       info: {
         title: 'Movie4you API',
         version: '1.0.0',
       },
     },
     apis: ['./src/routes/*.js'],
   };

   const swaggerSpec = swaggerJsdoc(swaggerOptions);
   app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
   ```

3. **Swagger UI'ye erişin:**
   ```
   http://localhost:5001/api-docs
   ```

## ✅ Kontrol Listesi

- [ ] Tüm endpoints dokümante edildi
- [ ] Request/Response örnekleri eklendi
- [ ] Authentication bilgileri eklendi
- [ ] Postman Collection oluşturuldu
- [ ] Postman Collection export edildi
- [ ] Postman Collection link'i alındı (veya JSON dosyası hazır)

## 🎯 Öğretmene Göstermek İçin

1. **Postman Collection JSON dosyası:**
   - `Movie4you_API.postman_collection.json`
   - Öğretmene gönderin

2. **Alternatif: Postman Public Link:**
   - Postman'de collection'ı paylaşın
   - Public link'i alın
   - Öğretmene link'i gönderin

3. **Alternatif: Bu dokümantasyon:**
   - `REST_API_DOCUMENTATION.md` dosyasını gönderin
   - Tüm endpoints ve örnekler içerir

## 📝 Endpoint Özeti

**Total Endpoints: 40+**

- Authentication: 3
- Users: 4
- Movies: 7
- Reviews: 4
- Favorites: 4
- Groups: 18+

## 💡 İpuçları

1. **Postman Collection:**
   - Her endpoint için örnek request ekleyin
   - Environment variables kullanın
   - Pre-request scripts ile token'ı otomatik set edin

2. **Dokümantasyon:**
   - Her endpoint için açıklama ekleyin
   - Request/Response örnekleri ekleyin
   - Error response'ları da dokümante edin

3. **Testing:**
   - Postman'de tüm endpoint'leri test edin
   - Collection'ı çalıştırılabilir hale getirin

