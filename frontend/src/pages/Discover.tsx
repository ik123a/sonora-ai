import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { buildRadio, recommend } from '../ai/recommendations';
import { PageHead, Tile } from '../components/Tile';

export function Discover() {
  const { tracks } = useLibrary();
  const { setQueue, currentTrack } = usePlayer();
  const picks = recommend(currentTrack?.id, 12);
  const moods = ['Chill', 'Focus', 'Workout', 'Party', 'Sleep', 'Nostalgic'];

  function startRadio(): void {
    const radio = buildRadio(currentTrack?.id, 25).map((r) => r.track);
    if (radio.length) setQueue(radio, 0);
  }
  return (
    <div className="space-y-8">
      <PageHead title="Discover" />
      <section>
        <div className="eyebrow mb-4">Made for you</div>
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
          {picks.map((t) => (
            <Tile
              key={t.id}
              src={t.artworkUrl}
              seed={`${t.title}-${t.album}`}
              title={t.title}
              meta={t.artist}
              onClick={() => setQueue([t], 0)}
            />
          ))}
        </div>
        {picks.length === 0 && (
          <p className="text-sm" style={{ color: 'var(--sonora-dim)' }}>Import music to get recommendations.</p>
        )}
      </section>
      <section>
        <div className="eyebrow mb-4">Smart radio</div>
        {/* The single amber action on this page — everything else is ghost. */}
        <button onClick={startRadio} className="btn-amber px-6 py-2.5 text-sm">
          ▶ Start Smart Radio
        </button>
        <p className="mt-2 text-sm" style={{ color: 'var(--sonora-muted)' }}>
          {currentTrack ? `Seeded from “${currentTrack.title}”` : 'Seeded from your listening taste'}
        </p>
        <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--sonora-dim)' }}>
          Weighted by artist affinity · genre · recency — max 3 per artist
        </p>
      </section>
      <section>
        <div className="eyebrow mb-4">Mood mixes</div>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setQueue(tracks, 0)}
              className="pill btn-ghost px-5 py-2.5"
            >
              {m}
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
