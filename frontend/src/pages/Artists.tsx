import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export function Artists() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  const map = new Map<string, typeof tracks>();
  for (const t of tracks) {
    if (!map.has(t.artist)) map.set(t.artist, []);
    map.get(t.artist)!.push(t);
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Artists ({map.size})</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...map.entries()].map(([name, list]) => (
          <button key={name} onClick={() => setQueue(list, 0)} className="rounded-xl bg-white/5 p-4 text-left hover:bg-white/10">
            <div className="truncate font-medium">{name}</div>
            <div className="truncate text-sm text-gray-400">{list.length} tracks</div>
          </button>
        ))}
      </div>
      {map.size === 0 && <p className="text-sm text-gray-400">No artists yet.</p>}
    </div>
  );
}
