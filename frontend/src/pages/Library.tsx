import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { PageHead, TrackRow } from '../components/Tile';

export function Library() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  return (
    <div className="space-y-6">
      <PageHead title="Library" count={tracks.length} />
      <div className="space-y-0.5">
        {tracks.map((t, i) => (
          <TrackRow
            key={t.id}
            index={i}
            title={t.title}
            artist={t.artist}
            album={t.album}
            duration={t.duration}
            artworkUrl={t.artworkUrl}
            onPlay={() => setQueue(tracks, i)}
          />
        ))}
      </div>
      {tracks.length === 0 && (
        <p className="text-sm" style={{ color: 'var(--sonora-dim)' }}>
          Import music from Home to populate your library.
        </p>
      )}
    </div>
  );
}
