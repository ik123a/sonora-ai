export interface Track {
  id: string;
  title: string;
  artist: string;
  album: string;
  albumArtist?: string;
  genre?: string;
  year?: number;
  trackNo?: number;
  discNo?: number;
  duration: number;
  bitrate?: number;
  codec?: string;
  artworkUrl?: string;
  filePath?: string;
  source: 'local' | 'downloaded' | 'provider';
  providerId?: string;
  liked?: boolean;
  playCount?: number;
  lastPlayedAt?: number;
  addedAt: number;
  lyrics?: string;
}

export interface Album { id: string; title: string; artist: string; year?: number; genre?: string; artworkUrl?: string; trackIds: string[]; }
export interface Artist { id: string; name: string; genre?: string; artworkUrl?: string; trackIds: string[]; }
export interface Playlist { id: string; name: string; description?: string; trackIds: string[]; createdAt: number; updatedAt: number; smart?: boolean; rules?: SmartRule[]; }
export interface SmartRule { field: 'energy' | 'genre' | 'addedAt' | 'playCount' | 'liked' | 'explicit'; op: '>' | '<' | '=' | 'contains' | 'inLastDays'; value: string | number | boolean; }
export interface QueueItem { trackId: string; queueId: string; }
export type RepeatMode = 'off' | 'all' | 'one';
export interface ProviderState { id: string; name: string; enabled: boolean; authenticated: boolean; }
export interface AIProviderConfig { id: string; name: string; apiKey: string; baseUrl: string; model: string; organizationId?: string; projectId?: string; isDefault: boolean; kind: 'openai-compatible' | 'anthropic' | 'gemini' | 'ollama' | 'lmstudio' | 'custom'; taskRouting?: Record<string, string>; }
export interface ToolResult { success: boolean; message?: string; data?: unknown; }
export type PermissionLevel = 'READ' | 'PLAYBACK' | 'PLAYLIST' | 'DOWNLOAD' | 'SYSTEM';
