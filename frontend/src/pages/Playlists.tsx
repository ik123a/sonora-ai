import { useState } from 'react';
import { useLibrary } from '../stores/useLibrary';
import { usePlaylists } from '../stores/usePlaylists';
import { usePlayer } from '../stores/usePlayer';

export function Playlists() {
  const { playlists, create, remove, addTracks, createSmart, evaluateSmart } = usePlaylists();
  const { tracks } = useLibrary();
  const { setQueue } = usePlayer();
  const [name, setName] = useState('');
  const byId = new Map(tracks.map((t) => [t.id, t]));
  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="text-2xl font-bold">Playlists ({playlists.length})</h1>
      <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); if (name.trim()) { create(name.trim()); setName(''); } }}>
        <input value={name} onChange={(e) => setName(e.target.value)} placeholder="New playlist name" className="flex-1 rounded-lg bg-white/5 px-3 py-2" aria-label="New playlist name" />
        <button className="rounded bg-violet-600 px-4">Create</button>
      </form>
      <button className="rounded border border-white/20 px-3 py-2 text-sm" onClick={() => createSmart('Recently Discovered', [{ field: 'addedAt', op: 'inLastDays', value: 30 }])}>+ Smart: Recently Discovered</button>
      {playlists.map((p) => {
        const ids = p.smart ? evaluateSmart(p, tracks) : p.trackIds;
        const list = ids.map((id) => byId.get(id)).filter((x) => x !== undefined);
        return (
          <div key={p.id} className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.name} {p.smart && <span className="text-xs text-violet-300">smart</span>} <span className="text-xs text-gray-400">· {list.length}</span></div>
              <div className="flex gap-2 text-xs">
                <button className="rounded border border-white/20 px-2 py-1" onClick={() => setQueue(list, 0)}>Play</button>
                <button className="rounded border border-white/20 px-2 py-1" onClick={() => addTracks(p.id, tracks.slice(0, 5).map((t) => t.id))}>+5</button>
                <button className="rounded border border-red-500/50 px-2 py-1" onClick={() => { if (window.confirm(`Delete "${p.name}"?`)) remove(p.id); }}>Delete</button>
              </div>
            </div>
          </div>
        );
      })}
      {playlists.length === 0 && <p className="text-sm text-gray-400">No playlists yet. Export/import M3U in Phase 7.</p>}
    </div>
  );
}
