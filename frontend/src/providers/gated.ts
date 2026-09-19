import type { ToolResult } from '../types';
import type { MusicProvider } from './types';

function needAuth(name: string): MusicProvider {
  return {
    id: name.toLowerCase(), name, enabled: false, authenticated: false,
    async search(): Promise<never[]> { throw new Error(`${name} needs API credentials. Add them in Settings → Providers, then authenticate.`); },
    async getTrack() { return null; },
    async getAlbum() { return null; },
    async getArtist() { return null; },
    async getPlaylist() { return null; },
    async getRecommendations() { return []; },
    async getLyrics() { return null; },
    async getStream() { return null; },
    async download(): Promise<ToolResult> { return { success: false, message: `${name} downloads only where the service grants offline rights.` }; },
    async authenticate() { return false; },
  };
}

export const spotifyProvider = needAuth('Spotify');
export const youtubeProvider = needAuth('YouTube');
export const tidalProvider = needAuth('Tidal');
export const deezerProvider = needAuth('Deezer');
