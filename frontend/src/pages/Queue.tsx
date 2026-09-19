import { usePlayer } from '../stores/usePlayer';

export function Queue() {
  const { queue, index, currentTrack, setQueue } = usePlayer();
  function move(from: number, to: number): void {
    const next = [...queue];
    const [t] = next.splice(from, 1);
    next.splice(to, 0, t);
    setQueue(next, to <= index && from > index ? index + 1 : to >= index && from < index ? index - 1 : index);
  }
  return (
    <div className="max-w-3xl space-y-2">
      <h1 className="text-2xl font-bold">Queue ({queue.length})</h1>
      {currentTrack && <p className="text-sm text-gray-400">Now: {currentTrack.title} — {currentTrack.artist}</p>}
      {queue.map((t, i) => (
        <div key={`${t.id}-${i}`} className={`flex items-center gap-2 rounded-lg px-3 py-2 ${i === index ? 'bg-violet-600/20' : 'hover:bg-white/5'}`}>
          <span className="min-w-0 flex-1 truncate text-sm"><span className="font-medium">{t.title}</span> <span className="text-gray-400">· {t.artist}</span></span>
          <button className="text-xs text-gray-400" onClick={() => move(i, Math.max(0, i - 1))} aria-label="Move up">↑</button>
          <button className="text-xs text-gray-400" onClick={() => move(i, Math.min(queue.length - 1, i + 1))} aria-label="Move down">↓</button>
          <button className="text-xs text-gray-400" onClick={() => setQueue(queue.filter((_, x) => x !== i), Math.min(index, queue.length - 2))} aria-label="Remove">✕</button>
        </div>
      ))}
      {queue.length === 0 && <p className="text-sm text-gray-400">Queue is empty. Play anything to fill it.</p>}
      {queue.length > 0 && <button className="rounded border border-white/20 px-3 py-2 text-sm" onClick={() => setQueue([], 0)}>Clear queue</button>}
    </div>
  );
}
