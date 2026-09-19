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
