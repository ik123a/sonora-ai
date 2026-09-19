import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export function History() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  const played = tracks.filter((t) => (t.playCount ?? 0) > 0).slice(0, 50);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Recently Played</h1>
      {played.map((t, i) => (
        <button key={t.id} onClick={() => setQueue(played, i)} className="block w-full truncate rounded-lg px-3 py-2 text-left hover:bg-white/5">
          <span className="font-medium">{t.title}</span> <span className="text-sm text-gray-400">· {t.artist} · {t.playCount} plays</span>
        </button>
      ))}
      {played.length === 0 && <p className="text-sm text-gray-400">Play counts are tracked locally as you listen.</p>}
    </div>
  );
}
