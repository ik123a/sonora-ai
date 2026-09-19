const KEY = 'sonora.ai.memory.v1';

export interface Memory { favorites: string[]; genres: string[]; updatedAt: number; }

export function loadMemory(): Memory {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Memory;
  } catch {
    return { favorites: [], genres: [], updatedAt: Date.now() };
  }
  return { favorites: [], genres: [], updatedAt: Date.now() };
}

export function clearMemory(): void { localStorage.removeItem(KEY); }
