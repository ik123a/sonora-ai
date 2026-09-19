import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';

export function Library() {
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Library ({tracks.length})</h1>
      <div className="space-y-1">
        {tracks.map((t, i) => (
          <button key={t.id} onClick={() => setQueue(tracks, i)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-white/5">
            <span className="truncate"><span className="font-medium">{t.title}</span> <span className="text-sm text-gray-400">· {t.artist} · {t.album}</span></span>
            <span className="text-xs text-gray-500">{t.duration ? `${Math.round(t.duration / 60)}:${String(Math.round(t.duration % 60)).padStart(2, '0')}` : ''}</span>
          </button>
        ))}
        {tracks.length === 0 && <p className="text-sm text-gray-400">Import music from Home to populate your library.</p>}
      </div>
    </div>
  );
}
