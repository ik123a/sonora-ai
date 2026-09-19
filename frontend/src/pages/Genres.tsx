import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export function Genres() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  const map = new Map<string, typeof tracks>();
  for (const t of tracks) {
    const g = t.genre ?? 'Unknown';
    if (!map.has(g)) map.set(g, []);
    map.get(g)!.push(t);
  }
  return (
    <div className="space-y-3">
      <h1 className="text-2xl font-bold">Genres ({map.size})</h1>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {[...map.entries()].map(([g, list]) => (
          <button key={g} onClick={() => setQueue(list, 0)} className="rounded-xl bg-white/5 p-4 text-left hover:bg-white/10">
            <div className="truncate font-medium">{g}</div>
            <div className="truncate text-sm text-gray-400">{list.length} tracks</div>
          </button>
        ))}
      </div>
    </div>
  );
}
