export interface Location {
  latitude: number;
  longitude: number;
}

export interface ImageData {
  id: string;
  url: string;
  latitude: number;
  longitude: number;
  uploadedByName: string;
  uploadedByEmail: string;
  uploadedByPhotoUrl?: string;
  uploadedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  picture?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}
