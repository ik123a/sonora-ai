import { useEffect, useRef, useState } from 'react';
import { engine } from '../audio/engine';

export function Visualizer({ mode = 'bars' }: { mode?: 'bars' | 'minimal' }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const [on, setOn] = useState(true);
  useEffect(() => {
    if (!on) return;
    let raf = 0;
    const draw = (): void => {
      const c = ref.current;
      if (c) {
        const ctx = c.getContext('2d');
        if (ctx) {
          const data = engine.spectrum();
          ctx.clearRect(0, 0, c.width, c.height);
          if (mode === 'minimal') {
            ctx.fillStyle = '#8b5cf6';
            const avg = data.reduce((a, b) => a + b, 0) / data.length;
            ctx.beginPath(); ctx.arc(c.width / 2, c.height / 2, 8 + avg * 30, 0, Math.PI * 2); ctx.fill();
          } else {
            const w = c.width / data.length;
            data.forEach((v, i) => {
              ctx.fillStyle = '#8b5cf6';
              ctx.fillRect(i * w, c.height - v * c.height, w - 1, v * c.height);
            });
          }
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [on, mode]);
  return (
    <div className="rounded-xl bg-white/5 p-3">
      <div className="mb-2 flex justify-between text-sm">
        <span className="font-medium">Visualizer</span>
        <button onClick={() => setOn(!on)} className="text-xs text-gray-400">{on ? 'Disable' : 'Enable'}</button>
      </div>
      {on && <canvas ref={ref} width={320} height={96} className="w-full rounded bg-black/40" aria-label="Audio visualizer" />}
    </div>
  );
}
