import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { PageHead, Tile } from '../components/Tile';

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
    <div className="space-y-6">
      <PageHead title="Albums" count={albums.size} />
      <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {[...albums.entries()].map(([name, list]) => (
          <Tile
            key={name}
            src={list.find((t) => t.artworkUrl)?.artworkUrl}
            seed={name}
            title={list[0].album}
            meta={`${list.length} track${list.length === 1 ? '' : 's'}`}
            onClick={() => setQueue(list, 0)}
          />
        ))}
      </div>
      {albums.size === 0 && (
        <p className="text-sm" style={{ color: 'var(--sonora-dim)' }}>
          No albums yet — import a folder from Home.
        </p>
      )}
    </div>
  );
}
