import { useState } from 'react';
import { EQ_BANDS, EQ_PRESETS, engine } from '../audio/engine';

export function Equalizer() {
  const [preset, setPreset] = useState('Flat');
  const [gains, setGains] = useState<number[]>([...EQ_PRESETS.Flat]);
  const [preamp, setPreamp] = useState(0);
  function apply(g: number[], pre: number): void {
    setGains(g); setPreamp(pre); engine.setEQ(g, pre);
  }
  return (
    <div className="rounded-xl bg-white/5 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-semibold">Equalizer</h2>
        <select value={preset} onChange={(e) => { setPreset(e.target.value); apply([...EQ_PRESETS[e.target.value]], preamp); }} className="rounded bg-white/10 px-2 py-1 text-sm" aria-label="EQ preset">
          {Object.keys(EQ_PRESETS).map((k) => <option key={k}>{k}</option>)}
        </select>
      </div>
      <div className="flex items-end gap-2">
        {EQ_BANDS.map((f, i) => (
          <label key={f} className="flex flex-col items-center gap-1 text-[10px] text-gray-400">
            <input type="range" min={-12} max={12} step={0.5} value={gains[i]} onChange={(e) => { const g = [...gains]; g[i] = Number(e.target.value); apply(g, preamp); setPreset('Custom'); }} aria-label={`${f} Hz`} className="h-24" style={{ writingMode: 'vertical-lr', direction: 'rtl' }} />
            {f >= 1000 ? `${f / 1000}k` : f}
          </label>
        ))}
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs text-gray-400">
        Preamp {preamp.toFixed(1)} dB
        <input type="range" min={-12} max={12} step={0.5} value={preamp} onChange={(e) => apply(gains, Number(e.target.value))} aria-label="Preamp" className="w-40" />
      </label>
    </div>
  );
}
