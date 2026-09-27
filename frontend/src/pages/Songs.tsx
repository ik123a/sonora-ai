import { useMemo, useState } from 'react';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { PageHead, TrackRow } from '../components/Tile';

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
    <div className="space-y-6">
      <PageHead title="Songs" count={list.length} />
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-0 flex-1 items-center gap-2 rounded-full border px-4 py-2"
          style={{ borderColor: 'var(--sonora-line-strong)', background: 'var(--sonora-panel)' }}>
          <span className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--sonora-dim)' }} aria-hidden>Find</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Title, artist or album…"
            aria-label="Filter songs"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:opacity-60"
          />
        </label>
        <div className="flex items-center gap-1" role="group" aria-label="Sort songs">
          {(['title', 'artist', 'recent'] as const).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSort(s)}
              aria-pressed={sort === s}
              className="pill px-4 py-2 transition-colors"
              style={{
                color: sort === s ? 'var(--sonora-accent)' : 'var(--sonora-muted)',
                borderColor: sort === s ? 'var(--sonora-accent)' : 'var(--sonora-line-strong)',
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
      <div className="space-y-0.5">
        {list.map((t, i) => (
          <TrackRow
            key={t.id}
            index={i}
            title={t.title}
            artist={t.artist}
            album={t.album}
            duration={t.duration}
            artworkUrl={t.artworkUrl}
            liked={t.liked}
            onToggleLike={() => toggleLike(t.id)}
            onPlay={() => setQueue(list, i)}
          />
        ))}
      </div>
      {list.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--sonora-dim)' }}>
          {tracks.length === 0 ? 'No songs yet — import a folder from Home.' : 'No songs match that filter.'}
        </p>
      )}
    </div>
  );
}
