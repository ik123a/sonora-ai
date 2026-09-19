import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { recommend } from '../ai/recommendations';

export function Discover() {
  const { tracks } = useLibrary();
  const { setQueue, currentTrack } = usePlayer();
  const picks = recommend(currentTrack?.id, 12);
  const moods = ['Chill', 'Focus', 'Workout', 'Party', 'Sleep', 'Nostalgic'];
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Discover</h1>
      <section>
        <h2 className="mb-2 font-semibold">Made For You</h2>
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
        <h2 className="mb-2 font-semibold">Mood Mixes</h2>
        <div className="flex flex-wrap gap-2">
          {moods.map((m) => (
            <button key={m} onClick={() => setQueue(tracks, 0)} className="rounded-full border border-white/15 px-4 py-2 text-sm hover:bg-white/5">{m}</button>
          ))}
        </div>
      </section>
    </div>
  );
}
