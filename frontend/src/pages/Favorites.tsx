import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export function Favorites() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  const favs = tracks.filter((t) => t.liked);
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold">Favorites ({favs.length})</h1>
      {favs.map((t, i) => (
        <button key={t.id} onClick={() => setQueue(favs, i)} className="block w-full truncate rounded-lg px-3 py-2 text-left hover:bg-white/5">
          <span className="font-medium">{t.title}</span> <span className="text-sm text-gray-400">· {t.artist}</span>
        </button>
      ))}
      {favs.length === 0 && <p className="text-sm text-gray-400">Tap ♡ on any song to save it here.</p>}
    </div>
  );
}
