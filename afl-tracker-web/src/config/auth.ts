export const authConfig = {
  clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
  redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback`,
  scope: 'https://www.googleapis.com/auth/youtube.readonly profile email',
  authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenEndpoint: 'https://oauth2.googleapis.com/token',
};
