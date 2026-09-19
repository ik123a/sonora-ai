import { useEffect, useState } from 'react';
import { registry } from '../providers/registry';
import { appleProvider, deezerProvider, spotifyProvider, tidalProvider, youtubeProvider, ytmusicProvider } from '../providers/gated';
import { finishSpotifyLogin, getClientId, setClientId, spotifyLinked, spotifyLogin, spotifyLogout, spotifyPlaylists } from '../providers/spotify';
import { loadSubsonic, saveSubsonic, subsonicProvider } from '../providers/subsonic';
import { useLibrary } from '../stores/useLibrary';
import { usePlaylists } from '../stores/usePlaylists';

const gated = [spotifyProvider, youtubeProvider, ytmusicProvider, tidalProvider, deezerProvider, appleProvider];

export function Providers() {
  const [, force] = useState(0);
  const [clientId, setCid] = useState(() => getClientId());
  const [linked, setLinked] = useState(() => spotifyLinked());
  const [sub, setSub] = useState(() => loadSubsonic());
  const [note, setNote] = useState('');
  const all = [...registry.list(), ...gated];

  useEffect(() => {
    void finishSpotifyLogin().then((ok) => {
      if (ok) { setLinked(true); setNote('Spotify linked — official data APIs only, playback stays local.'); }
    });
  }, []);

  async function importSpotifyPlaylist(id: string, name: string): Promise<void> {
    try {
      const mod = await import('../providers/spotify');
      const pl = await mod.spotifyDataProvider.getPlaylist(id);
      if (!pl) return;
      const tracks = useLibrary.getState().tracks;
      const byIsrc = new Map(tracks.filter((t) => t.isrc).map((t) => [t.isrc as string, t.id]));
      const ids: string[] = [];
      for (const tid of pl.trackIds) {
        const spo = await mod.spotifyDataProvider.getTrack(tid);
        const hit = (spo?.isrc && byIsrc.get(spo.isrc))
          ?? tracks.find((t) => t.title.toLowerCase() === (spo?.title ?? '').toLowerCase()
            && t.artist.toLowerCase().includes((spo?.artist ?? '').split(',')[0].toLowerCase()))?.id;
        if (hit) ids.push(hit);
      }
      usePlaylists.getState().create(`${name} (matched)`, ids, 'Matched from Spotify to local library');
      setNote(`Imported “${name}”: ${ids.length}/${pl.trackIds.length} tracks matched locally.`);
    } catch (e) {
      setNote(`Import failed — ${e instanceof Error ? e.message : 'network error'}`);
    }
  }

  return (
    <div className="max-w-2xl space-y-5">
      <div>
        <div className="eyebrow">Providers</div>
        <h1 className="text-3xl">Sources</h1>
      </div>

      <div className="card space-y-2 p-4">
        <div className="font-semibold">Spotify <span className="pill ml-1 border-emerald-500/50 px-2 py-0.5 text-emerald-300">official data</span></div>
        <p className="text-xs text-neutral-400">Free Spotify account + free dev Client ID. Reads top tracks, playlists, search — audio always plays from your local library. No Premium needed, no unofficial APIs.</p>
        <label className="block text-xs text-neutral-400">Client ID
          <input value={clientId} onChange={(e) => { setCid(e.target.value); setClientId(e.target.value); }} placeholder="From developer.spotify.com (add this page as redirect URI)" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs" aria-label="Spotify Client ID" />
        </label>
        {linked
          ? <div className="flex gap-2"><button className="pill px-3 py-1.5 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => { spotifyLogout(); setLinked(false); }}>Unlink</button><SpotifyImports onImport={importSpotifyPlaylist} /></div>
          : <button className="btn-amber px-4 py-2 text-sm" onClick={() => void spotifyLogin().catch((e: unknown) => setNote(e instanceof Error ? e.message : 'Login failed'))}>Log in with Spotify</button>}
      </div>

      <div className="card space-y-2 p-4">
        <div className="font-semibold">Subsonic / Navidrome <span className="pill ml-1 border-sky-500/50 px-2 py-0.5 text-sky-300">your server</span></div>
        <label className="block text-xs text-neutral-400">Server URL
          <input value={sub.baseUrl} onChange={(e) => { const v = { ...sub, baseUrl: e.target.value }; setSub(v); saveSubsonic(v); }} placeholder="https://music.example.com" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs" aria-label="Subsonic server URL" />
        </label>
        <div className="flex gap-2">
          <label className="flex-1 text-xs text-neutral-400">User
            <input value={sub.user} onChange={(e) => { const v = { ...sub, user: e.target.value }; setSub(v); saveSubsonic(v); }} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" aria-label="Subsonic user" />
          </label>
          <label className="flex-1 text-xs text-neutral-400">Password
            <input type="password" value={sub.password} onChange={(e) => { const v = { ...sub, password: e.target.value }; setSub(v); saveSubsonic(v); }} className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" aria-label="Subsonic password" />
          </label>
        </div>
        <button className="pill px-3 py-1.5 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => void subsonicProvider.authenticate().then((ok) => { setNote(ok ? 'Subsonic server reachable.' : 'Subsonic ping failed — check URL/user/password.'); force((x) => x + 1); })}>Test connection</button>
      </div>

      {all.map((p) => (
        <div key={p.id} className="card flex items-center justify-between p-3">
          <div>
            <div className="font-medium">{p.name}</div>
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">{p.enabled ? 'enabled' : 'disabled'} · {p.authenticated ? 'authenticated' : 'needs auth'}</div>
          </div>
          <button className="pill px-3 py-1.5 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => { p.enabled = !p.enabled; force((x) => x + 1); }}>
            {p.enabled ? 'Disable' : 'Enable'}
          </button>
        </div>
      ))}
      {note && <p className="text-sm text-neutral-300" role="status">{note}</p>}
      <p className="font-mono text-[11px] text-neutral-600">Spotify / YouTube / Tidal / Deezer / Apple stay disabled until official credentials complete. No scraping, no DRM bypass.</p>
    </div>
  );
}

function SpotifyImports({ onImport }: { onImport: (id: string, name: string) => Promise<void> }) {
  const [lists, setLists] = useState<Array<{ id: string; name: string; count: number }>>([]);
  useEffect(() => { void spotifyPlaylists().then(setLists).catch(() => undefined); }, []);
  if (!lists.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {lists.slice(0, 5).map((p) => (
        <button key={p.id} className="pill px-3 py-1.5 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => void onImport(p.id, p.name)}>
          Import {p.name} ({p.count})
        </button>
      ))}
    </div>
  );
}
