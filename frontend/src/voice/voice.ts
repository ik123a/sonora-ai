export async function listenOnce(): Promise<string> {
  const SR = (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown }).SpeechRecognition
    ?? (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition;
  if (!SR) throw new Error('Browser speech recognition unavailable. Use Whisper-compatible STT in packaged builds.');
  return new Promise((resolve, reject) => {
    const rec = new (SR as new () => { lang: string; onresult: ((e: { results: Array<Array<{ transcript: string }>> }) => void) | null; onerror: ((e: unknown) => void) | null; onend: (() => void) | null; start: () => void })();
    rec.lang = 'en-US';
    rec.onresult = (e) => resolve(e.results[0][0].transcript);
    rec.onerror = () => reject(new Error('Voice recognition failed'));
    rec.onend = () => undefined;
    rec.start();
  });
}

export function speak(text: string): void {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(new SpeechSynthesisUtterance(text.slice(0, 400)));
}

function wait(ms: number): Promise<void> { return new Promise((r) => setTimeout(r, ms)); }

function waitForSpeech(): Promise<void> {
  if (!('speechSynthesis' in window)) return Promise.resolve();
  return new Promise((resolve) => {
    const tick = (): void => {
      if (!window.speechSynthesis.speaking) resolve();
      else setTimeout(tick, 200);
    };
    setTimeout(tick, 300);
  });
}

export type TalkStatus = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

export interface TalkHandlers {
  onStatus: (s: TalkStatus, detail?: string) => void;
  onUser: (text: string) => void;
  respond: (text: string) => Promise<string>;
}

export function startTalk(h: TalkHandlers): () => void {
  let alive = true;
  const loop = async (): Promise<void> => {
    await wait(400);
    while (alive) {
      h.onStatus('listening');
      let text = '';
      try {
        text = await listenOnce();
      } catch (e) {
        if (!alive) break;
        h.onStatus('error', e instanceof Error ? e.message : 'Microphone unavailable');
        await wait(1500);
        continue;
      }
      if (!alive || !text.trim()) continue;
      h.onUser(text);
      h.onStatus('thinking');
      try {
        const reply = await h.respond(text);
        if (!alive) break;
        h.onStatus('speaking');
        speak(reply);
        await waitForSpeech();
      } catch (e) {
        h.onStatus('error', e instanceof Error ? e.message : 'Agent failed');
        await wait(1200);
      }
    }
    h.onStatus('idle');
  };
  void loop();
  return () => {
    alive = false;
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    h.onStatus('idle');
  };
}
