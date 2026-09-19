const SCHEMA_STATEMENTS = [
  'CREATE TABLE IF NOT EXISTS tracks(id TEXT PRIMARY KEY, title TEXT NOT NULL, artist TEXT, album TEXT, genre TEXT, year INTEGER, duration REAL, filePath TEXT, source TEXT, providerId TEXT, liked INTEGER DEFAULT 0, playCount INTEGER DEFAULT 0, lastPlayedAt INTEGER, addedAt INTEGER, artworkUrl TEXT, lyrics TEXT)',
  'CREATE INDEX IF NOT EXISTS idx_tracks_artist ON tracks(artist)',
  'CREATE INDEX IF NOT EXISTS idx_tracks_album ON tracks(album)',
  'CREATE INDEX IF NOT EXISTS idx_tracks_title ON tracks(title)',
  'CREATE TABLE IF NOT EXISTS playlists(id TEXT PRIMARY KEY, name TEXT NOT NULL, description TEXT, trackIds TEXT, createdAt INTEGER, updatedAt INTEGER, smart INTEGER DEFAULT 0, rules TEXT)',
  'CREATE TABLE IF NOT EXISTS history(id INTEGER PRIMARY KEY AUTOINCREMENT, trackId TEXT, playedAt INTEGER)',
  'CREATE TABLE IF NOT EXISTS favorites(trackId TEXT PRIMARY KEY, addedAt INTEGER)',
  'CREATE TABLE IF NOT EXISTS settings(key TEXT PRIMARY KEY, value TEXT)',
  'CREATE TABLE IF NOT EXISTS ai_memory(key TEXT PRIMARY KEY, value TEXT)',
  'CREATE TABLE IF NOT EXISTS downloads(id TEXT PRIMARY KEY, trackId TEXT, status TEXT, progress REAL, filePath TEXT)',
  'CREATE TABLE IF NOT EXISTS lyrics(trackId TEXT PRIMARY KEY, text TEXT, synced INTEGER DEFAULT 0)',
];

function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI__' in window;
}

export const db = {
  async migrate(): Promise<void> {
    if (!isTauri()) return;
    const mod = await import('@tauri-apps/plugin-sql');
    const conn = await mod.default.load('sqlite:sonora.db');
    try {
      for (const stmt of SCHEMA_STATEMENTS) await conn.execute(stmt);
    } finally {
      await conn.close();
    }
  },
  async sql<T>(query: string, params: unknown[] = []): Promise<T[]> {
    if (!isTauri()) return [];
    const mod = await import('@tauri-apps/plugin-sql');
    const conn = await mod.default.load('sqlite:sonora.db');
    try {
      const rows = await conn.select<T>(query, params);
      return Array.isArray(rows) ? rows : [];
    } finally {
      await conn.close();
    }
  },
  async exec(query: string, params: unknown[] = []): Promise<void> {
    if (!isTauri()) return;
    const mod = await import('@tauri-apps/plugin-sql');
    const conn = await mod.default.load('sqlite:sonora.db');
    try {
      await conn.execute(query, params);
    } finally {
      await conn.close();
    }
  },
};
