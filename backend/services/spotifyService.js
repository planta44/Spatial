const axios = require('axios');

class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID;
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  async getAccessToken() {
    if (this.accessToken && this.tokenExpiry > Date.now()) {
      return this.accessToken;
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    
    try {
      const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        'grant_type=client_credentials',
        {
          headers: {
            'Authorization': `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      this.accessToken = response.data.access_token;
      this.tokenExpiry = Date.now() + (response.data.expires_in * 1000);
      return this.accessToken;
    } catch (error) {
      console.error('Spotify auth error:', error.message);
      throw error;
    }
  }

  async getArtistData(artistId) {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/artists/${artistId}`,
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      return {
        spotifyId: response.data.id,
        name: response.data.name,
        genres: response.data.genres,
        followerCount: response.data.followers.total,
        popularity: response.data.popularity,
        spotifyUrl: response.data.external_urls.spotify,
        imageUrl: response.data.images[0]?.url
      };
    } catch (error) {
      console.error('Spotify API error:', error.message);
      return null;
    }
  }

  async searchArtist(query) {
    const token = await this.getAccessToken();
    
    try {
      const response = await axios.get(
        `https://api.spotify.com/v1/search`,
        {
          params: { q: query, type: 'artist', limit: 10 },
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      return response.data.artists.items;
    } catch (error) {
      console.error('Spotify search error:', error.message);
      return [];
    }
  }
}

module.exports = new SpotifyService();