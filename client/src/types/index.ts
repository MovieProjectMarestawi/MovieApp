export interface Movie {
  id: number;
  title: string;
  posterUrl: string;
  rating: number;
  year: number;
  genre: string[];
  duration: number;
  description: string;
  director: string;
  cast: string[];
  inCinemas?: boolean;
  releaseDate?: string;
}

export interface Review {
  id: number;
  movieId: number;
  username: string;
  rating: number;
  text: string;
  date: string;
  avatar: string;
}

export interface Group {
  id: number;
  name: string;
  description: string;
  owner: string;
  ownerId: number;
  members: number;
  movieCount?: number;
  imageUrl: string;
  isPublic: boolean;
  membersList?: string[];
}

export interface User {
  id: number;
  username: string;
  email: string;
  avatar: string;
  favoriteMovies: number[];
  groups: number[];
}

export interface GroupJoinRequest {
  groupId: number;
  groupName: string;
  status: 'pending' | 'approved' | 'rejected';
}

