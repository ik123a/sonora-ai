import { useEffect, useRef, useState } from 'react';
import { usePlayer } from '../stores/usePlayer';
import { activeLineIndex, fetchSyncedLyrics, lyricsFor, type LyricLine } from '../services/lyrics';

export function LyricsPanel() {
  const { currentTrack } = usePlayer();
  const [text, setText] = useState('No track playing.');
  const [lines, setLines] = useState<LyricLine[] | null>(null);
  const [position, setPosition] = useState(0);
  const [loading, setLoading] = useState(false);
  const activeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLines(null);
    setPosition(0);
    if (!currentTrack) { setText('No track playing.'); return; }
    void lyricsFor(currentTrack.id).then((r) => setText(r.text));
  }, [currentTrack]);

  useEffect(() => {
    const id = window.setInterval(() => {
      const el = document.querySelector('audio');
      if (el) setPosition(el.currentTime);
    }, 500);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [position, lines]);

  async function loadKaraoke(): Promise<void> {
    if (!currentTrack) return;
    setLoading(true);
    try {
      const synced = await fetchSyncedLyrics(currentTrack.artist, currentTrack.title);
      if (synced) setLines(synced);
      else setText('No synced lyrics on LRCLIB for this track yet.');
    } catch {
      setText('Lyrics lookup failed — check connection.');
    } finally {
      setLoading(false);
    }
  }

  const active = lines ? activeLineIndex(lines, position) : -1;

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold uppercase tracking-wide">Lyrics</h2>
        {currentTrack && !lines && (
          <button className="pill px-3 py-1.5 hover:border-[#ffb800] hover:text-[#ffb800]" disabled={loading} onClick={() => void loadKaraoke()}>
            {loading ? 'Searching…' : 'Karaoke view'}
          </button>
        )}
      </div>
      {lines ? (
        <div className="max-h-80 space-y-1 overflow-auto" aria-label="Synced lyrics">
          {lines.map((l, i) => (
            <div key={i} ref={i === active ? activeRef : undefined}
              className={`rounded px-2 py-1 text-sm transition-colors ${i === active ? 'bg-[#ffb800]/15 font-semibold text-[#ffb800]' : 'text-neutral-400'}`}>
              {l.text}
            </div>
          ))}
        </div>
      ) : (
        <p className="whitespace-pre-wrap text-sm text-neutral-300">{text}</p>
      )}
    </div>
  );
}
