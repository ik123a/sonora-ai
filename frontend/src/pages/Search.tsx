import { useState } from 'react';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { registry } from '../providers/registry';

export function Search() {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<ReturnType<typeof useLibrary.getState>['tracks']>([]);
  const [note, setNote] = useState('');
  const { setQueue } = usePlayer();

  async function run(query: string): Promise<void> {
    setQ(query);
    if (!query.trim()) { setResults([]); return; }
    const local = await registry.get('local')!.search(query);
    let extra: typeof local = [];
    try { extra = await registry.get('musicbrainz')!.search(query); } catch { setNote('MusicBrainz unavailable — showing local results.'); }
    setResults([...local, ...extra].slice(0, 40));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Search</h1>
      <input autoFocus value={q} onChange={(e) => void run(e.target.value)} placeholder="Songs, albums, artists, moods — e.g. lofi songs for studying" className="w-full rounded-lg bg-white/5 px-4 py-3" aria-label="Search music" />
      {note && <p className="text-xs text-amber-300">{note}</p>}
      <div className="space-y-1">
        {results.map((t) => (
          <button key={t.id} onClick={() => setQueue([t], 0)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/5">
            <span><span className="font-medium">{t.title}</span> <span className="text-sm text-gray-400">· {t.artist} · {t.album}</span></span>
            <span className="text-xs text-gray-500">{t.providerId ?? 'local'}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
