import { useState } from 'react';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { filesToTracks } from '../library/scanner';

const BARS = [42, 68, 55, 88, 73, 95, 60, 80, 50, 70, 90, 62];

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
    <div className="space-y-8">
      <header className="card relative overflow-hidden p-8">
        <div className="pointer-events-none absolute inset-x-8 bottom-0 flex h-28 items-end gap-2 opacity-25" aria-hidden>
          {BARS.map((h, i) => (
            <span key={i} className="eq-bar w-full rounded-t-full bg-gradient-to-t from-[#ffb800] to-[#ff6a00]" style={{ height: `${h}%`, animationDelay: `${i * 90}ms` }} />
          ))}
        </div>
        <div className="eyebrow">Good evening · Your library</div>
        <h1 className="font-display mt-2 max-w-xl text-5xl font-bold uppercase leading-[0.95]">
          Your music.<br />Your rules. <span className="text-[#ffb800]">Your AI.</span>
        </h1>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-400">
          Ad-free, local-first playback with an agent that acts — import a folder and ask Sonora to play, mix or explain it.
        </p>
        <label className="mt-5 inline-block cursor-pointer rounded-full bg-[#ffb800] px-6 py-2.5 text-sm font-semibold text-black hover:bg-[#ffc933]">
          Import music folder
          <input type="file" multiple className="hidden" onChange={(e) => void onFiles(e.target.files)} aria-label="Import music files" />
        </label>
        <div className="mt-2 font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">MP3 · FLAC · WAV · AAC · M4A · OGG · OPUS · AIFF{status ? ` — ${status}` : ''}</div>
      </header>
      <section>
        <div className="eyebrow mb-3">Continue listening</div>
        {recent.length === 0 ? <p className="text-sm text-neutral-500">Nothing here yet — your recent tracks land here.</p> : (
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {recent.map((t) => (
              <button key={t.id} className="card card-hover p-4 text-left" onClick={() => setQueue([t], 0)}>
                <div className="font-mono text-[10px] uppercase tracking-[0.18em] text-neutral-500">{t.genre ?? 'Unknown genre'}</div>
                <div className="mt-1 truncate text-sm font-semibold">{t.title}</div>
                <div className="truncate text-xs text-neutral-400">{t.artist}</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
