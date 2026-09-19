import type { Album, Artist, Playlist, ToolResult, Track } from '../types';

export interface MusicProvider {
  id: string;
  name: string;
  enabled: boolean;
  authenticated: boolean;
  search(query: string): Promise<Track[]>;
  getTrack(id: string): Promise<Track | null>;
  getAlbum(id: string): Promise<Album | null>;
  getArtist(id: string): Promise<Artist | null>;
  getPlaylist(id: string): Promise<Playlist | null>;
  getRecommendations(seedTrackId: string): Promise<Track[]>;
  getLyrics(trackId: string): Promise<string | null>;
  getStream(trackId: string): Promise<string | null>;
  download(trackId: string): Promise<ToolResult>;
  authenticate(): Promise<boolean>;
}
