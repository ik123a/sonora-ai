import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { PageHead, Tile } from '../components/Tile';

export function Artists() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  const map = new Map<string, typeof tracks>();
  for (const t of tracks) {
    if (!map.has(t.artist)) map.set(t.artist, []);
    map.get(t.artist)!.push(t);
  }
  return (
    <div className="space-y-6">
      <PageHead title="Artists" count={map.size} />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[...map.entries()].map(([name, list]) => (
          <Tile
            key={name}
            aspect="circle"
            src={list.find((t) => t.artworkUrl)?.artworkUrl}
            seed={name}
            title={name}
            meta={`${list.length} track${list.length === 1 ? '' : 's'}`}
            onClick={() => setQueue(list, 0)}
          />
        ))}
      </div>
      {map.size === 0 && (
        <p className="text-sm" style={{ color: 'var(--sonora-dim)' }}>No artists yet.</p>
      )}
    </div>
  );
}
