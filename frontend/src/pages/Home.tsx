import { useState } from 'react';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { filesToTracks } from '../library/scanner';

export function Home() {
  const { tracks, addTracks } = useLibrary();
  const { setQueue } = usePlayer();
  const [status, setStatus] = useState('');
  const recent = tracks.slice(-8).reverse();

  async function onFiles(files: FileList | null): Promise<void> {
    if (!files) return;
    setStatus('Scanning…');
    const { tracks: found, skipped } = await filesToTracks(files);
    addTracks(found);
    setStatus(`Added ${found.length} tracks${skipped.length ? `, skipped ${skipped.length}` : ''}.`);
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Good Evening</h1>
      <label className="block rounded-xl border border-dashed border-white/20 p-6 text-sm text-gray-300">
        Import a music folder to start (MP3, FLAC, WAV, AAC, M4A, OGG, OPUS, AIFF)
        <input type="file" multiple className="mt-3 block" onChange={(e) => void onFiles(e.target.files)} aria-label="Import music files" />
        {status && <div className="mt-2 text-xs text-gray-400">{status}</div>}
      </label>
      <section>
        <h2 className="mb-2 font-semibold">Recently Added</h2>
        {recent.length === 0 ? <p className="text-sm text-gray-400">Nothing here yet.</p> : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recent.map((t) => (
              <button key={t.id} className="rounded-xl bg-white/5 p-3 text-left hover:bg-white/10" onClick={() => setQueue([t], 0)}>
                <div className="truncate text-sm font-medium">{t.title}</div>
                <div className="truncate text-xs text-gray-400">{t.artist}</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
