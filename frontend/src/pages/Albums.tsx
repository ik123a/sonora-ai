import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export function Albums() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  const albums = new Map<string, typeof tracks>();
  for (const t of tracks) {
    const k = `${t.album} — ${t.artist}`;
    if (!albums.has(k)) albums.set(k, []);
    albums.get(k)!.push(t);
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Albums ({albums.size})</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...albums.entries()].map(([name, list]) => (
          <button key={name} onClick={() => setQueue(list, 0)} className="rounded-xl bg-white/5 p-4 text-left hover:bg-white/10">
            <div className="truncate font-medium">{list[0].album}</div>
            <div className="truncate text-sm text-gray-400">{list[0].artist} · {list.length} tracks</div>
          </button>
        ))}
      </div>
      {albums.size === 0 && <p className="text-sm text-gray-400">No albums yet.</p>}
    </div>
  );
}
