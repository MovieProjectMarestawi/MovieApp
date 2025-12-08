// Use relative path in production (Docker), absolute URL in development
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD ? '/api' : 'http://localhost:5000/api');

// Helper function to get token from localStorage
const getToken = (): string | null => {
  return localStorage.getItem('token');
};

// Helper function to handle response
const handleResponse = async (response: Response) => {
  const data = await response.json();

  if (!response.ok) {
    // Handle 401 (Unauthorized) - token expired or invalid
    // Don't redirect automatically, let the calling code handle it
    if (response.status === 401) {
      // Only remove token, don't redirect
      // The component or AuthContext will handle the redirect if needed
      localStorage.removeItem('token');
    }
    // Create error with status code for better handling
    const error = new Error(data.message || 'An error occurred');
    (error as any).status = response.status;
    throw error;
  }

  return data;
};

// API service object
export const api = {
  get: async (endpoint: string, requiresAuth = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers,
    });

    return handleResponse(response);
  },

  post: async (endpoint: string, data: any, requiresAuth = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  put: async (endpoint: string, data: any, requiresAuth = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });

    return handleResponse(response);
  },

  delete: async (endpoint: string, requiresAuth = false) => {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (requiresAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
    });

    return handleResponse(response);
  },
};

// Auth API functions
export const authAPI = {
  register: async (email: string, password: string) => {
    const response = await api.post('/auth/register', { email, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },

  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  },

  logout: async () => {
    try {
      await api.post('/auth/logout', {}, true);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
    }
  },
};

// User API functions
export const userAPI = {
  getProfile: async () => {
    const response = await api.get('/users/me', true);
    return response.data.user;
  },

  updateProfile: async (email: string) => {
    const response = await api.put('/users/me', { email }, true);
    return response.data.user;
  },

  changePassword: async (currentPassword: string, newPassword: string) => {
    await api.put('/users/me/password', { currentPassword, newPassword }, true);
  },

  deleteAccount: async () => {
    await api.delete('/users/me', true);
    localStorage.removeItem('token');
  },
};

// Movies API functions
export const moviesAPI = {
  search: async (query?: string, genre?: number, year?: number, page = 1) => {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (genre) params.append('genre', genre.toString());
    if (year) params.append('year', year.toString());
    params.append('page', page.toString());

    const response = await api.get(`/movies/search?${params.toString()}`);
    return response.data;
  },

  getPopular: async (page = 1) => {
    const response = await api.get(`/movies/popular?page=${page}`);
    return response.data;
  },

  discover: async (page = 1, genre?: number, year?: number, sortBy = 'popularity.desc') => {
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('sort_by', sortBy);
    if (genre) params.append('genre', genre.toString());
    if (year) params.append('year', year.toString());
    
    const response = await api.get(`/movies/discover?${params.toString()}`);
    return response.data;
  },

  getNowPlaying: async (region = 'FI', page = 1) => {
    const response = await api.get(`/movies/now-playing?region=${region}&page=${page}`);
    return response.data;
  },

  getDetails: async (movieId: number) => {
    const response = await api.get(`/movies/${movieId}`);
    return response.data;
  },

  getGenres: async () => {
    const response = await api.get('/movies/genres');
    return response.data.genres;
  },

  getReviews: async (movieId: number, page = 1, limit = 20) => {
    const response = await api.get(`/movies/${movieId}/reviews?page=${page}&limit=${limit}`);
    return response.data;
  },
};

// Reviews API functions
export const reviewsAPI = {
  create: async (movieId: number, rating: number, text: string) => {
    const response = await api.post(
      '/reviews',
      {
        movie_id: movieId,
        rating,
        text,
      },
      true
    );
    return response.data.review;
  },

  getAll: async (movieId?: number, page = 1, limit = 20, userId?: number) => {
    const params = new URLSearchParams();
    if (movieId) params.append('movie_id', movieId.toString());
    if (userId) params.append('user_id', userId.toString());
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/reviews?${params.toString()}`);
    return response.data;
  },

  update: async (reviewId: number, rating?: number, text?: string) => {
    const response = await api.put(
      `/reviews/${reviewId}`,
      {
        rating,
        text,
      },
      true
    );
    return response.data.review;
  },

  delete: async (reviewId: number) => {
    await api.delete(`/reviews/${reviewId}`, true);
  },
};

// Favorites API functions
export const favoritesAPI = {
  add: async (movieId: number) => {
    const response = await api.post('/users/me/favorites', { movie_id: movieId }, true);
    return response.data.favorite;
  },

  getAll: async () => {
    const response = await api.get('/users/me/favorites', true);
    return response.data.favorites;
  },

  remove: async (movieId: number) => {
    await api.delete(`/users/me/favorites/${movieId}`, true);
  },

  getShareable: async (userId: number) => {
    const response = await api.get(`/favorites/share/${userId}`);
    return response.data;
  },
};

// Groups API functions
export const groupsAPI = {
  create: async (name: string, description?: string) => {
    const response = await api.post('/groups', { name, description }, true);
    return response.data.group;
  },

  getAll: async (page = 1, limit = 20) => {
    const response = await api.get(`/groups?page=${page}&limit=${limit}`, true);
    return response.data;
  },

  getDetails: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}`, true);
    return response.data.group;
  },

  update: async (groupId: number, name?: string, description?: string) => {
    const response = await api.put(`/groups/${groupId}`, { name, description }, true);
    return response.data.group;
  },

  requestToJoin: async (groupId: number) => {
    const response = await api.post(`/groups/${groupId}/join`, {}, true);
    return response.data.join_request;
  },

  getJoinRequests: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/requests`, true);
    return response.data;
  },

  approveRequest: async (groupId: number, requestId: number) => {
    await api.post(`/groups/${groupId}/requests/${requestId}/approve`, {}, true);
  },

  rejectRequest: async (groupId: number, requestId: number) => {
    await api.post(`/groups/${groupId}/requests/${requestId}/reject`, {}, true);
  },

  addMovie: async (groupId: number, movieId: number) => {
    const response = await api.post(`/groups/${groupId}/movies`, { movie_id: movieId }, true);
    return response.data.content;
  },

  getMovies: async (groupId: number) => {
    const response = await api.get(`/groups/${groupId}/movies`, true);
    return response.data.movies;
  },

  removeMovie: async (groupId: number, movieId: number) => {
    await api.delete(`/groups/${groupId}/movies/${movieId}`, true);
  },

  leave: async (groupId: number) => {
    await api.delete(`/groups/${groupId}/leave`, true);
  },

  removeMember: async (groupId: number, userId: number) => {
    await api.delete(`/groups/${groupId}/members/${userId}`, true);
  },

  delete: async (groupId: number) => {
    await api.delete(`/groups/${groupId}`, true);
  },

  getAllPendingRequests: async () => {
    const response = await api.get('/groups/notifications/requests', true);
    return response.data;
  },
};

