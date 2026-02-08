import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User, AuthTokens } from '@/types';
import { authConfig } from '@/config/auth';

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null);
  const tokens = ref<AuthTokens | null>(null);
  const isLoading = ref(false);

  const isAuthenticated = computed(() => !!user.value && !!tokens.value);

  // Initialize from localStorage
  const init = () => {
    const storedUser = localStorage.getItem('user');
    const storedTokens = localStorage.getItem('tokens');

    if (storedUser && storedTokens) {
      try {
        user.value = JSON.parse(storedUser);
        tokens.value = JSON.parse(storedTokens);

        // Check if token is expired
        if (tokens.value && tokens.value.expiresAt < Date.now()) {
          logout();
        }
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        logout();
      }
    }
  };

  const login = () => {
    const params = new URLSearchParams({
      client_id: authConfig.clientId,
      redirect_uri: authConfig.redirectUri,
      response_type: 'token',
      scope: authConfig.scope,
      include_granted_scopes: 'true',
      state: generateState(),
    });

    localStorage.setItem('oauth_state', params.get('state')!);
    window.location.href = `${authConfig.authorizationEndpoint}?${params.toString()}`;
  };

  const handleCallback = async (hash: string) => {
    isLoading.value = true;
    try {
      const params = new URLSearchParams(hash.substring(1));
      const accessToken = params.get('access_token');
      const expiresIn = params.get('expires_in');
      const state = params.get('state');

      // Verify state
      const storedState = localStorage.getItem('oauth_state');
      if (state !== storedState) {
        throw new Error('Invalid state parameter');
      }

      if (!accessToken || !expiresIn) {
        throw new Error('Missing access token or expiration');
      }

      // Store tokens
      tokens.value = {
        accessToken,
        expiresAt: Date.now() + parseInt(expiresIn) * 1000,
      };
      localStorage.setItem('tokens', JSON.stringify(tokens.value));

      // Fetch user info from YouTube first, fallback to Google
      let userInfo;

      try {
        // Try YouTube channel info first
        const youtubeResponse = await fetch(
          'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (youtubeResponse.ok) {
          const youtubeData = await youtubeResponse.json();

          // If user has a YouTube channel, use that info
          if (youtubeData.items && youtubeData.items.length > 0) {
            const channel = youtubeData.items[0];
            const snippet = channel.snippet;

            // Still need to get email from Google API
            const googleResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            });
            const googleData = await googleResponse.json();

            userInfo = {
              id: channel.id,
              name: snippet.title,
              email: googleData.email || '',
              picture: snippet.thumbnails.default.url,
            };
          }
        }
      } catch (error) {
        console.warn('Failed to fetch YouTube channel info, falling back to Google account:', error);
      }

      // Fallback to Google account info if YouTube fetch failed
      if (!userInfo) {
        const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch user info');
        }

        const data = await response.json();
        userInfo = {
          id: data.id,
          name: data.name,
          email: data.email,
          picture: data.picture,
        };
      }

      user.value = userInfo;
      localStorage.setItem('user', JSON.stringify(user.value));

      localStorage.removeItem('oauth_state');
    } catch (error) {
      console.error('Error handling OAuth callback:', error);
      logout();
      throw error;
    } finally {
      isLoading.value = false;
    }
  };

  const logout = () => {
    user.value = null;
    tokens.value = null;
    localStorage.removeItem('user');
    localStorage.removeItem('tokens');
    localStorage.removeItem('oauth_state');
  };

  const getAccessToken = (): string | null => {
    if (!tokens.value) return null;

    // Check if expired
    if (tokens.value.expiresAt < Date.now()) {
      logout();
      return null;
    }

    return tokens.value.accessToken;
  };

  return {
    user,
    tokens,
    isLoading,
    isAuthenticated,
    init,
    login,
    handleCallback,
    logout,
    getAccessToken,
  };
});

// Helper function to generate random state for CSRF protection
function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
