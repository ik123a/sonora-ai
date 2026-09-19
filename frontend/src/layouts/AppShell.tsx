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
    <div className="flex h-full bg-[#0a0a0b] text-[#f5f4f0]" onKeyDown={(e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); nav('/search'); }
    }}>
      <aside className="w-60 shrink-0 border-r border-white/10 bg-[#0d0d0f] p-4" aria-label="Primary">
        <div className="px-2 pb-1">
          <div className="font-display text-[26px] font-bold uppercase leading-none tracking-wide">Sonora <span className="text-[#ffb800]">AI</span></div>
          <div className="eyebrow mt-1">Your music · Your rules</div>
        </div>
        <nav className="mt-3 space-y-0.5">
          {NAV.map(([to, label]) => (
            <NavLink key={to} to={to} className={({ isActive }) => `flex items-center justify-between rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${isActive ? 'bg-[#ffb800] text-black' : 'text-neutral-400 hover:bg-white/5 hover:text-white'}`}>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 rounded-xl border border-white/10 bg-white/[0.02] p-3">
          <div className="eyebrow">Offline ready</div>
          <p className="mt-1 text-xs leading-relaxed text-neutral-400">Local library, downloads and playlists keep playing with no connection.</p>
        </div>
      </aside>
      <div className="flex min-w-0 flex-1 flex-col">
        {offline && <div className="bg-[#ffb800]/15 px-4 py-1 text-center font-mono text-[11px] uppercase tracking-[0.2em] text-[#ffb800]" role="status">Offline mode — local music keeps working</div>}
        <main className="min-h-0 flex-1 overflow-auto px-8 py-6"><Outlet /></main>
        <footer className="border-t border-white/10 bg-[#0d0d0f]/95 px-4 py-3 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-end justify-center gap-[3px] rounded-lg bg-white/5 pb-2 pt-2" aria-hidden>
              {[0.5, 0.9, 0.4, 0.7].map((h, i) => (
                <span key={i} className="w-[3px] rounded bg-[#ffb800]" style={{ height: `${Math.round(h * 28)}px`, opacity: isPlaying ? 1 : 0.35 }} />
              ))}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{currentTrack?.title ?? 'Nothing playing'}</div>
              <div className="truncate font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-500">{currentTrack?.artist ?? 'Import a folder to begin'}</div>
            </div>
            <button className="rounded-full p-2 text-neutral-300 hover:bg-white/10 hover:text-white" onClick={prev} aria-label="Previous">⏮</button>
            <button className="btn-amber px-5 py-2 text-base" onClick={toggle} aria-label="Play or pause">{isPlaying ? '⏸' : '▶'}</button>
            <button className="rounded-full p-2 text-neutral-300 hover:bg-white/10 hover:text-white" onClick={next} aria-label="Next">⏭</button>
            <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" className="w-24 accent-[#ffb800]" />
            <button className="pill px-4 py-2 text-[#f5f4f0] transition-colors hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => setAiOpen(!aiOpen)}>Ask Sonora AI</button>
          </div>
        </footer>
      </div>
      {aiOpen && (
        <aside className="flex w-80 shrink-0 flex-col border-l border-white/10 bg-[#0d0d0f]" aria-label="SONORA AI">
          <div className="border-b border-white/10 p-4">
            <div className="font-display text-xl font-semibold uppercase tracking-wide">Sonora <span className="text-[#8b5cf6]">AI</span></div>
            <div className="eyebrow mt-0.5" style={{ color: '#8b5cf6' }}>Action agent · not a chatbot</div>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
            {messages.length === 0 && <p className="text-sm text-neutral-400">Ask anything about your music… try “analyze my library”.</p>}
            {messages.map((m) => (
              <div key={m.id} className={`rounded-xl border p-2.5 text-sm leading-relaxed ${m.role === 'user' ? 'border-[#8b5cf6]/40 bg-[#8b5cf6]/10' : 'border-white/10 bg-white/[0.03]'}`}>{m.content}</div>
            ))}
          </div>
          <form className="flex gap-2 border-t border-white/10 p-3" onSubmit={(e) => { e.preventDefault(); if (input.trim()) { void ask(input); setInput(''); } }}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your music…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-neutral-600 focus:border-[#8b5cf6]" aria-label="Ask SONORA AI" />
            <button className="rounded-full bg-[#8b5cf6] px-4 font-semibold text-white hover:bg-[#9d71f7]" disabled={busy} aria-label="Send">{busy ? '…' : '➤'}</button>
          </form>
        </aside>
      )}
      {palette && (
        <div className="fixed inset-0 bg-black/70 p-8" onClick={() => setPalette(false)} role="dialog" aria-label="Command palette">
          <div className="card mx-auto max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="eyebrow mb-2">Command · Ctrl K</div>
            <input autoFocus placeholder="Type a command: play, search, create playlist…" className="w-full rounded-lg bg-white/5 px-3 py-2" aria-label="Command palette"
              onKeyDown={(e) => { if (e.key === 'Enter') { nav('/search'); setPalette(false); } if (e.key === 'Escape') setPalette(false); }} />
            <p className="mt-2 font-mono text-[11px] text-neutral-500">Enter → Search · Esc → Close</p>
          </div>
        </div>
      )}
    </div>
  );
}
