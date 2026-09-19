import { useMemo, useState } from 'react';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export function Songs() {
  const { tracks, toggleLike } = useLibrary();
  const { setQueue } = usePlayer();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'title' | 'artist' | 'recent'>('title');
  const list = useMemo(() => {
    const f = tracks.filter((t) => `${t.title} ${t.artist} ${t.album}`.toLowerCase().includes(q.toLowerCase()));
    return [...f].sort((a, b) => sort === 'artist' ? a.artist.localeCompare(b.artist) : sort === 'recent' ? b.addedAt - a.addedAt : a.title.localeCompare(b.title));
  }, [tracks, q, sort]);
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Songs ({list.length})</h1>
      <div className="flex gap-2">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter songs…" className="flex-1 rounded-lg bg-white/5 px-3 py-2" aria-label="Filter songs" />
        <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="rounded-lg bg-white/5 px-2" aria-label="Sort songs">
          <option value="title">Title</option><option value="artist">Artist</option><option value="recent">Recent</option>
        </select>
      </div>
      {list.map((t, i) => (
        <div key={t.id} className="flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-white/5">
          <button className="min-w-0 flex-1 truncate text-left" onClick={() => setQueue(list, i)}>
            <span className="font-medium">{t.title}</span> <span className="text-sm text-gray-400">· {t.artist} · {t.album}</span>
          </button>
          <button onClick={() => toggleLike(t.id)} aria-label={t.liked ? 'Unlike' : 'Like'} className={t.liked ? 'text-pink-400' : 'text-gray-500'}>{t.liked ? '♥' : '♡'}</button>
        </div>
      ))}
      {list.length === 0 && <p className="text-sm text-gray-400">No songs match.</p>}
    </div>
  );
}
