import { useState } from 'react';
import { useSleep } from '../stores/useSleep';

export function SleepButton() {
  const { mode, remainingSec, setMinutes, setEndOfTrack, setEndOfQueue, cancel } = useSleep();
  const [open, setOpen] = useState(false);
  const active = mode.kind !== 'off';
  const label = mode.kind === 'minutes'
    ? `${Math.floor(remainingSec / 60)}:${String(remainingSec % 60).padStart(2, '0')}`
    : mode.kind === 'endOfTrack' ? '1 track' : mode.kind === 'endOfQueue' ? 'Queue end' : '';

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)} aria-label="Sleep timer"
        className={`rounded-full p-2 ${active ? 'text-[#ffb800]' : 'text-neutral-400 hover:bg-white/10 hover:text-white'}`}>
        {active ? `◷ ${label}` : '◷'}
      </button>
      {open && (
        <div className="card absolute bottom-10 right-0 z-50 w-52 p-2" role="menu" aria-label="Sleep timer options">
          {[15, 30, 60, 120].map((m) => (
            <button key={m} className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => { setMinutes(m); setOpen(false); }}>
              After {m} min
            </button>
          ))}
          <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => { setEndOfTrack(); setOpen(false); }}>End of track</button>
          <button className="block w-full rounded-lg px-3 py-2 text-left text-sm hover:bg-white/5" onClick={() => { setEndOfQueue(); setOpen(false); }}>End of queue</button>
          {active && <button className="block w-full rounded-lg px-3 py-2 text-left text-sm text-red-300 hover:bg-white/5" onClick={() => { cancel(); setOpen(false); }}>Cancel timer</button>}
        </div>
      )}
    </div>
  );
}
