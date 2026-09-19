import { useEffect, useRef, useState } from 'react';
import { startTalk, type TalkStatus } from '../voice/voice';
import { useAI } from '../stores/useAI';

const STATUS_LABEL: Record<TalkStatus, string> = {
  idle: 'Tap Talk and speak — Sonora listens, acts, and answers out loud.',
  listening: 'Listening… speak now.',
  thinking: 'Thinking… running music tools.',
  speaking: 'Speaking… tap Stop anytime.',
  error: 'Hiccup — retrying. Check mic permission.',
};

export function AIMusic() {
  const { messages, ask } = useAI();
  const [status, setStatus] = useState<TalkStatus>('idle');
  const [talking, setTalking] = useState(false);
  const stopRef = useRef<(() => void) | null>(null);

  useEffect(() => () => stopRef.current?.(), []);

  function toggleTalk(): void {
    if (talking) {
      stopRef.current?.();
      stopRef.current = null;
      setTalking(false);
      setStatus('idle');
      return;
    }
    setTalking(true);
    stopRef.current = startTalk({
      onStatus: (s) => setStatus(s),
      onUser: (text) => void ask(text),
      respond: async (text) => {
        await ask(text);
        const all = useAI.getState().messages;
        const last = [...all].reverse().find((m) => m.role === 'assistant');
        return last?.content ?? 'Done.';
      },
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <div className="eyebrow">AI music · voice + text</div>
        <h1 className="text-3xl">Talk to Sonora</h1>
      </div>
      <div className="card flex items-center gap-4 p-5">
        <button onClick={toggleTalk} aria-label={talking ? 'Stop talking' : 'Start talking'}
          className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl transition-all ${talking ? 'bg-red-500 text-white' : 'btn-amber'}`}>
          {talking ? '■' : '🎙'}
        </button>
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className={`inline-block h-2 w-2 rounded-full ${status === 'listening' ? 'animate-pulse bg-[#ffb800]' : status === 'speaking' ? 'animate-pulse bg-[#8b5cf6]' : status === 'thinking' ? 'animate-pulse bg-white' : status === 'error' ? 'bg-red-500' : 'bg-neutral-600'}`} />
            <span className="text-neutral-400">{status}</span>
          </div>
          <p className="mt-1 text-sm text-neutral-300">{STATUS_LABEL[status]}</p>
          <p className="mt-1 font-mono text-[11px] text-neutral-600">“Play something relaxing” · “Skip this” · “What’s playing?” · “Like this song”</p>
        </div>
      </div>
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-xl border p-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/10' : 'border-white/10 bg-white/[0.03]'}`}>{m.content}</div>
        ))}
        {messages.length === 0 && <p className="text-sm text-neutral-500">No conversation yet — type below or hit Talk.</p>}
      </div>
      <TalkInput />
    </div>
  );
}

function TalkInput() {
  const { ask } = useAI();
  const [value, setValue] = useState('');
  return (
    <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (value.trim()) { void ask(value); setValue(''); } }}>
      <input value={value} onChange={(e) => setValue(e.target.value)} placeholder="Or type — “Make a 2-hour study playlist”" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm placeholder:text-neutral-600 focus:border-[#ffb800]" aria-label="Type to Sonora" />
      <button className="btn-amber px-5" aria-label="Send">➤</button>
    </form>
  );
}
