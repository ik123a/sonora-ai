import { useState } from 'react';
import { listenOnce, speak } from '../voice/voice';
import { useAI } from '../stores/useAI';

export function AIMusic() {
  const { messages, ask, busy } = useAI();
  const [voiceState, setVoiceState] = useState('');
  async function voice(): Promise<void> {
    try {
      setVoiceState('Listening…');
      const text = await listenOnce();
      setVoiceState('');
      await ask(text);
      const last = useAI.getState().messages.at(-1)?.content ?? 'Done';
      speak(last);
    } catch (e) {
      setVoiceState(e instanceof Error ? e.message : 'Voice failed');
    }
  }
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-2xl font-bold">AI Music</h1>
      <button onClick={() => void voice()} className="rounded-full bg-violet-600 px-5 py-3" aria-label="AI Voice">🎙 AI Voice{voiceState ? ` — ${voiceState}` : ''}</button>
      <div className="space-y-2">
        {messages.map((m) => (
          <div key={m.id} className={`rounded-lg p-2 text-sm ${m.role === 'user' ? 'bg-violet-600/20' : 'bg-white/5'}`}>{m.content}</div>
        ))}
        {busy && <p className="text-sm text-gray-400">Thinking…</p>}
      </div>
    </div>
  );
}
