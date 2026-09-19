import { useEffect, useState } from 'react';
import { usePlayer } from '../stores/usePlayer';
import { lyricsFor } from '../services/lyrics';

export function LyricsPanel() {
  const { currentTrack } = usePlayer();
  const [text, setText] = useState('No track playing.');
  useEffect(() => {
    if (!currentTrack) { setText('No track playing.'); return; }
    void lyricsFor(currentTrack.id).then((r) => setText(r.text));
  }, [currentTrack]);
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <h2 className="mb-2 font-semibold">Lyrics</h2>
      <p className="whitespace-pre-wrap text-sm text-gray-300">{text}</p>
    </div>
  );
}
