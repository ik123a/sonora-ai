import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePlayer } from '../stores/usePlayer';
import { useAI } from '../stores/useAI';
import { useOffline } from '../hooks/useOffline';

const NAV = [
  ['/', 'Home'], ['/discover', 'Discover'], ['/search', 'Search'], ['/library', 'Library'],
  ['/songs', 'Songs'], ['/albums', 'Albums'], ['/artists', 'Artists'], ['/genres', 'Genres'],
  ['/playlists', 'Playlists'], ['/downloads', 'Downloads'], ['/favorites', 'Favorites'],
  ['/history', 'Recently Played'], ['/ai', 'AI Music'], ['/queue', 'Queue'],
  ['/providers', 'Providers'], ['/settings', 'Settings'],
] as const;

export function AppShell() {
  const nav = useNavigate();
  const offline = useOffline();
  const { currentTrack, isPlaying, toggle, next, prev, volume, setVolume } = usePlayer();
  const [aiOpen, setAiOpen] = useState(true);
  const [palette, setPalette] = useState(false);
  const [input, setInput] = useState('');
  const { messages, ask, busy } = useAI();

  return (
    <div className="flex h-full bg-[#0b0b10] text-gray-100" onKeyDown={(e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); nav('/search'); }
    }}>
      <aside className="w-56 shrink-0 border-r border-white/10 bg-[#12121a] p-3" aria-label="Primary">
        <div className="px-2 py-3 text-lg font-bold tracking-wide">SONORA <span className="text-violet-400">AI</span></div>
        <nav className="space-y-0.5">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `block rounded-lg px-3 py-2 text-sm ${isActive ? 'bg-violet-600/20 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}>{label}</NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {offline && <div className="bg-amber-600/20 px-4 py-1 text-center text-xs text-amber-200" role="status">OFFLINE MODE — local music, downloads and playlists keep working</div>}
        <main className="min-h-0 flex-1 overflow-auto p-6"><Outlet /></main>
        <footer className="border-t border-white/10 bg-[#12121a]/90 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded bg-white/10" aria-hidden />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{currentTrack?.title ?? 'Nothing playing'}</div>
              <div className="truncate text-xs text-gray-400">{currentTrack?.artist ?? 'Import a folder to begin'}</div>
            </div>
            <button className="rounded p-2 hover:bg-white/10" onClick={prev} aria-label="Previous">⏮</button>
            <button className="rounded bg-violet-600 px-4 py-2" onClick={toggle} aria-label="Play or pause">{isPlaying ? '⏸' : '▶'}</button>
            <button className="rounded p-2 hover:bg-white/10" onClick={next} aria-label="Next">⏭</button>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" className="w-24" />
            <button className="rounded border border-violet-500/50 px-3 py-2 text-sm" onClick={() => setAiOpen(!aiOpen)}>Ask SONORA AI</button>
          </div>
        </footer>
      </div>
      {aiOpen && (
        <aside className="flex w-80 shrink-0 flex-col border-l border-white/10 bg-[#12121a]" aria-label="SONORA AI">
          <div className="border-b border-white/10 p-3 font-semibold">SONORA AI</div>
          <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
            {messages.length === 0 && <p className="text-sm text-gray-400">Ask anything about your music… try “analyze my library”.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`rounded-lg p-2 text-sm ${m.role === 'user' ? 'bg-violet-600/20' : 'bg-white/5'}`}>{m.content}</div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={(e) => { e.preventDefault(); if (input.trim()) { void ask(input); setInput(''); } }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your music…" className="min-w-0 flex-1 rounded bg-white/5 px-3 py-2 text-sm" aria-label="Ask SONORA AI" />
            <button className="rounded bg-violet-600 px-3" disabled={busy} aria-label="Send">{busy ? '…' : '➤'}</button>
          </form>
        </aside>
      )}
      {palette && (
        <div className="fixed inset-0 bg-black/60 p-8" onClick={() => setPalette(false)} role="dialog" aria-label="Command palette">
          <div className="mx-auto max-w-lg rounded-xl bg-[#1a1a24] p-4" onClick={(e) => e.stopPropagation()}>
            <input autoFocus placeholder="Type a command: play, search, create playlist…" className="w-full rounded bg-white/5 px-3 py-2" aria-label="Command palette"
              onKeyDown={(e) => { if (e.key === 'Enter') { nav('/search'); setPalette(false); } if (e.key === 'Escape') setPalette(false); }} />
            <p className="mt-2 text-xs text-gray-400">Enter → Search · Esc → Close</p>
          </div>
        </div>
      )}
    </div>
  );
}
