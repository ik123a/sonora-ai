import type { ToolResult } from '../types';
import type { MusicProvider } from './types';

export const mockProvider: MusicProvider = {
  id: 'mock', name: 'Mock (dev only)', enabled: false, authenticated: true,
  async search() { return []; },
  async getTrack() { return null; },
  async getAlbum() { return null; },
  async getArtist() { return null; },
  async getPlaylist() { return null; },
  async getRecommendations() { return []; },
  async getLyrics() { return '[MOCK] lyrics unavailable in mock provider.'; },
  async getStream() { return null; },
  async download(): Promise<ToolResult> { return { success: false, message: '[MOCK] downloads disabled.' }; },
  async authenticate() { return true; },
};
