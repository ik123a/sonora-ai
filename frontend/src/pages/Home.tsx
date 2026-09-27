import { useRef, useState } from 'react';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { filesToTracks } from '../library/scanner';
import { Tile } from '../components/Tile';

const BARS = [42, 68, 55, 88, 73, 95, 60, 80, 50, 70, 90, 62];

export function Home() {
  const { tracks, addTracks } = useLibrary();
  const { setQueue } = usePlayer();
  const [status, setStatus] = useState('');
  const [skipped, setSkipped] = useState<Array<{ name: string; reason: string }>>([]);
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const recent = tracks.slice(-8).reverse();

  async function ingest(files: FileList | File[] | null): Promise<void> {
    if (!files || !files.length) return;
    setStatus('Scanning…');
    setSkipped([]);
    const { tracks: found, skipped: missed } = await filesToTracks(files);
    addTracks(found);
    setSkipped(missed);
    setStatus(`Added ${found.length} track${found.length === 1 ? '' : 's'}${missed.length ? `, skipped ${missed.length}` : ''}.`);
  }

  return (
    <div className="space-y-10">
      {/* Hero. One dominant element (the display headline), one amber action.
          The equalizer is a band of motion, not a row of static bars. */}
      <header
        className="card relative overflow-hidden p-8 lg:p-12"
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); void ingest(e.dataTransfer.files); }}
        style={dragging ? { borderColor: 'var(--sonora-accent)' } : undefined}
      >
        <div className="pointer-events-none absolute inset-x-0 bottom-0 flex h-32 items-end gap-1.5 opacity-20" aria-hidden>
          {BARS.map((h, i) => (
            <span key={i} className="eq-bar flex-1 rounded-t-full" style={{ height: `${h}%`, animationDelay: `${i * 90}ms`, background: 'linear-gradient(to top, var(--sonora-accent), #ff6a00)' }} />
          ))}
        </div>
        <div className="eyebrow">Good evening · Your library</div>
        {/* Two explicit, non-wrapping lines. At lg:text-7xl the second line
            overflowed max-w-2xl and wrapped, orphaning "AI." onto its own
            row — the same class of bug the nexus-mall headline had. */}
        <h1 className="font-display mt-3 text-5xl font-bold uppercase leading-[0.92] tracking-tight lg:text-6xl">
          <span className="block whitespace-nowrap">Your music.</span>
          <span className="block whitespace-nowrap">
            <span style={{ color: 'var(--sonora-dim)' }}>Your rules.</span>{' '}
            <span style={{ color: 'var(--sonora-accent)' }}>Your AI.</span>
          </span>
        </h1>
        <p className="mt-5 max-w-lg leading-relaxed" style={{ color: 'var(--sonora-muted)' }}>
          Ad-free, local-first playback with an agent that acts — import a folder and ask Sonora to play, mix or explain it.
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <label className="btn-amber inline-flex cursor-pointer items-center gap-2 px-6 py-3 text-sm">
            Import music folder
            <input
              ref={inputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => void ingest(e.target.files)}
              aria-label="Import music files"
            />
          </label>
          <span className="pill px-4 py-2" style={{ color: 'var(--sonora-dim)' }}>
            or drop files here
          </span>
        </div>
        <div className="mt-4 font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--sonora-dim)' }}>
          MP3 · FLAC · WAV · AAC · M4A · OGG · OPUS · AIFF
          {status ? ` — ${status}` : ''}
        </div>
        {skipped.length > 0 && (
          <ul className="mt-3 space-y-1" aria-live="polite">
            {skipped.map((s) => (
              <li key={s.name} className="truncate text-xs" style={{ color: 'var(--sonora-dim)' }}>
                {s.name}: {s.reason}
              </li>
            ))}
          </ul>
        )}
      </header>

      <section>
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <div className="eyebrow">Continue listening</div>
          {recent.length > 0 ? (
            <span className="font-mono text-[11px] uppercase tracking-[0.16em]" style={{ color: 'var(--sonora-dim)' }}>
              {tracks.length} in library
            </span>
          ) : null}
        </div>
        {recent.length === 0 ? (
          // Empty state that instructs instead of apologising: three concrete
          // next steps rather than one dead sentence.
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['01', 'Drop a folder', 'Any music folder on this machine works — nothing is uploaded.'],
              ['02', 'Ask the agent', 'Try “analyze my library” or “play something for focus”.'],
              ['03', 'Keep it offline', 'Downloads, playlists and the whole library play with no connection.'],
            ].map(([n, title, body]) => (
              <div key={n} className="card p-5">
                <div className="font-mono text-[11px] tracking-[0.2em]" style={{ color: 'var(--sonora-accent)' }}>{n}</div>
                <div className="mt-2 text-sm font-semibold">{title}</div>
                <p className="mt-1 text-sm leading-relaxed" style={{ color: 'var(--sonora-muted)' }}>{body}</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {recent.map((t) => (
              <Tile
                key={t.id}
                src={t.artworkUrl}
                seed={`${t.title}-${t.album}`}
                title={t.title}
                meta={t.artist}
                onClick={() => setQueue([t], 0)}
              />
            ))}
          </div>
        )}
      </section>

      {tracks.length > 0 ? (
        <section>
          <div className="eyebrow mb-4">Jump back in</div>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
            {tracks.slice(0, 12).map((t) => (
              <Tile
                key={`lib-${t.id}`}
                src={t.artworkUrl}
                seed={`${t.album}-${t.artist}`}
                title={t.album}
                meta={t.artist}
                onClick={() => setQueue([t], 0)}
              />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
