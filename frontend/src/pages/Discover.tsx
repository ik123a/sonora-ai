import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { buildRadio, recommend } from '../ai/recommendations';

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
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discover</h1>
      <section>
        <div className="eyebrow mb-3">Made for you</div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {picks.map((t) => (
            <button key={t.id} onClick={() => setQueue([t], 0)} className="rounded-xl bg-white/5 p-3 text-left hover:bg-white/10">
              <div className="truncate text-sm font-medium">{t.title}</div>
              <div className="truncate text-xs text-gray-400">{t.artist}</div>
            </button>
          ))}
          {picks.length === 0 && <p className="text-sm text-gray-400">Import music to get recommendations.</p>}
        </div>
      </section>
      <section>
        <div className="eyebrow mb-3">Smart radio</div>
        <button onClick={startRadio} className="btn-amber px-6 py-2.5 text-sm">
          ▶ Start Smart Radio{currentTrack ? ` — from ${currentTrack.title}` : ' — from your taste'}
        </button>
        <p className="mt-1 font-mono text-[11px] text-neutral-500">Weighted by artist affinity · genre · recency — max 3 per artist</p>
      </section>
      <section>
        <div className="eyebrow mb-3">Mood mixes</div>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <button key={m} onClick={() => setQueue(tracks, 0)} className="pill px-5 py-2.5 text-neutral-300 transition-colors hover:border-[#ffb800] hover:text-[#ffb800]">{m}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
