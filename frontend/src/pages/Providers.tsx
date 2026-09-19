import { useState } from 'react';
import { registry } from '../providers/registry';
import { deezerProvider, spotifyProvider, tidalProvider, youtubeProvider } from '../providers/gated';

const gated = [spotifyProvider, youtubeProvider, tidalProvider, deezerProvider];

export function Providers() {
  const [, force] = useState(0);
  const all = [...registry.list(), ...gated];
  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-2xl font-bold">Providers</h1>
      {all.map((p) => (
        <div key={p.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="text-xs text-gray-400">{p.enabled ? 'enabled' : 'disabled'} · {p.authenticated ? 'authenticated' : 'needs auth'}</div>
          </div>
          <button className="rounded border border-white/20 px-3 py-1 text-sm" onClick={() => { p.enabled = !p.enabled; force((x) => x + 1); }}>
            {p.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
      <p className="text-xs text-gray-500">Spotify / YouTube / Tidal / Deezer stay disabled until you add credentials and complete their official auth flows. No scraping, no DRM bypass.</p>
    </div>
  );
}
