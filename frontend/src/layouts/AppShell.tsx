import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { usePlayer } from '../stores/usePlayer';
import { useAI } from '../stores/useAI';
import { useOffline } from '../hooks/useOffline';
import { SleepButton } from '../components/SleepButton';
import { Artwork } from '../components/Artwork';

/** Grouped so 16 destinations stop reading as one undifferentiated list. */
const NAV_GROUPS = [
  {
    label: 'Listen',
    items: [
      ['/', 'Home'], ['/discover', 'Discover'], ['/search', 'Search'], ['/library', 'Library'],
      ['/queue', 'Queue'],
    ],
  },
  {
    label: 'Browse',
    items: [
      ['/songs', 'Songs'], ['/albums', 'Albums'], ['/artists', 'Artists'],
      ['/genres', 'Genres'], ['/playlists', 'Playlists'],
    ],
  },
  {
    label: 'Yours',
    items: [
      ['/downloads', 'Downloads'], ['/favorites', 'Favorites'], ['/history', 'Recently Played'],
    ],
  },
  {
    label: 'System',
    items: [['/ai', 'AI Music'], ['/providers', 'Providers'], ['/settings', 'Settings']],
  },
] as const;

export function AppShell() {
  const nav = useNavigate();
  const offline = useOffline();
  const { currentTrack, isPlaying, toggle, next, prev, volume, setVolume } = usePlayer();
  // Both the rail and the agent panel are always-on furniture on desktop, but
  // they are overlays below lg — so neither may start open on a phone, or the
  // first paint is a full-screen drawer covering the content.
  const isNarrow = () => typeof window !== 'undefined' && window.matchMedia('(max-width: 1023px)').matches;
  const [aiOpen, setAiOpen] = useState(() => !isNarrow());
  const [navOpen, setNavOpen] = useState(false);
  const [palette, setPalette] = useState(false);
  const [input, setInput] = useState('');
  const { messages, ask, busy } = useAI();

  return (
    <div className="flex h-full" style={{ background: 'var(--sonora-bg)', color: 'var(--sonora-text)' }} onKeyDown={(e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); setPalette(true); }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'l') { e.preventDefault(); nav('/search'); }
    }}>
      {/* Fixed 240px rail + fixed 320px agent panel can never fit a phone:
          they alone total 560px, which is what produced the 719px-wide
          scroll area in a 390px viewport. Both are now opt-in overlays
          below the lg breakpoint, so narrow screens get the content only. */}
      <aside
        className={`${navOpen ? 'max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:z-40' : 'max-lg:hidden'} w-60 shrink-0 overflow-y-auto border-r p-4 max-lg:w-64 max-lg:shadow-2xl`}
        style={{ borderColor: 'var(--sonora-line)', background: 'var(--sonora-panel)' }}
        aria-label="Primary"
      >
        <div className="px-2 pb-4">
          <div className="font-display text-[26px] font-bold uppercase leading-none tracking-wide">
            Sonora <span style={{ color: 'var(--sonora-accent)' }}>AI</span>
          </div>
          <div className="eyebrow mt-1">Your music · Your rules</div>
        </div>
        <nav className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <div className="px-3 pb-1.5 font-mono text-[10px] uppercase tracking-[0.2em]" style={{ color: 'var(--sonora-dim)' }}>
                {group.label}
              </div>
              <div className="space-y-0.5">
                {group.items.map(([to, label]) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={to === '/'}
                    onClick={() => setNavOpen(false)}
                    className={({ isActive }) =>
                      `block rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                        isActive ? 'font-semibold' : ''
                      }`}
                    style={({ isActive }) => ({
                      background: isActive ? 'var(--sonora-accent)' : 'transparent',
                      color: isActive ? 'var(--sonora-accent-ink)' : 'var(--sonora-muted)',
                    })}
                  >
                    {label}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>
        <div className="mt-5 rounded-xl border p-3" style={{ borderColor: 'var(--sonora-line)' }}>
          <div className="eyebrow">Offline ready</div>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'var(--sonora-muted)' }}>
            Local library, downloads and playlists keep playing with no connection.
          </p>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Narrow screens lose the persistent rail and agent panel, so both
            need a trigger, and the player bar has to drop to its essentials. */}
        <div className="flex items-center gap-2 border-b px-3 py-2 lg:hidden" style={{ borderColor: 'var(--sonora-line)' }}>
          <button
            type="button"
            onClick={() => setNavOpen((v) => !v)}
            aria-expanded={navOpen}
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            className="rounded-lg border px-3 py-1.5 text-sm"
            style={{ borderColor: 'var(--sonora-line-strong)', color: 'var(--sonora-muted)' }}
          >
            ☰
          </button>
          <span className="font-display text-lg font-bold uppercase tracking-wide">
            Sonora <span style={{ color: 'var(--sonora-accent)' }}>AI</span>
          </span>
          <button
            type="button"
            onClick={() => setAiOpen((v) => !v)}
            aria-expanded={aiOpen}
            aria-label={aiOpen ? 'Close Sonora AI' : 'Open Sonora AI'}
            className="pill ml-auto px-3 py-1.5"
            style={{ color: aiOpen ? 'var(--sonora-ai)' : 'var(--sonora-muted)', borderColor: aiOpen ? 'var(--sonora-ai)' : 'var(--sonora-line-strong)' }}
          >
            AI
          </button>
        </div>
        {offline && (
          <div className="px-4 py-1 text-center font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{ background: 'color-mix(in srgb, var(--sonora-accent) 15%, transparent)', color: 'var(--sonora-accent)' }}
            role="status">
            Offline mode — local music keeps working
          </div>
        )}
        <main className="min-h-0 flex-1 overflow-auto px-8 py-6"><Outlet /></main>

        <footer className="border-t px-4 py-3 backdrop-blur" style={{ borderColor: 'var(--sonora-line)', background: 'color-mix(in srgb, var(--sonora-panel) 95%, transparent)' }}>
          <div className="flex items-center gap-4">
            <Artwork
              src={currentTrack?.artworkUrl}
              seed={`${currentTrack?.title ?? 'none'}-${currentTrack?.artist ?? 'none'}`}
              alt=""
              rounded="rounded-md"
              className="h-11 w-11 shrink-0"
            />
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-semibold">{currentTrack?.title ?? 'Nothing playing'}</div>
              <div className="truncate font-mono text-[11px] uppercase tracking-[0.14em]" style={{ color: 'var(--sonora-dim)' }}>
                {currentTrack?.artist ?? 'Import a folder to begin'}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button className="rounded-full p-2.5 text-lg transition-colors" style={{ color: 'var(--sonora-muted)' }} onClick={prev} aria-label="Previous track">⏮</button>
              <button className="btn-amber px-5 py-2 text-base" onClick={toggle} aria-label={isPlaying ? 'Pause' : 'Play'}>{isPlaying ? '⏸' : '▶'}</button>
              <button className="rounded-full p-2.5 text-lg transition-colors" style={{ color: 'var(--sonora-muted)' }} onClick={next} aria-label="Next track">⏭</button>
            </div>
            <label className="hidden items-center gap-2 sm:flex">
              <span className="sr-only">Volume</span>
              <input type="range" min={0} max={1} step={0.01} value={volume} onChange={(e) => setVolume(Number(e.target.value))} aria-label="Volume" className="w-24" style={{ accentColor: 'var(--sonora-accent)' }} />
            </label>
            <div className="hidden sm:block"><SleepButton /></div>
            <button
              className="pill px-4 py-2 transition-colors"
              style={{ color: aiOpen ? 'var(--sonora-ai)' : 'var(--sonora-muted)', borderColor: aiOpen ? 'var(--sonora-ai)' : 'var(--sonora-line-strong)' }}
              onClick={() => setAiOpen(!aiOpen)}
              aria-pressed={aiOpen}
            >
              Ask Sonora AI
            </button>
          </div>
        </footer>
      </div>

      {aiOpen && (
        <aside
          className={`${aiOpen ? 'max-lg:fixed max-lg:inset-y-0 max-lg:right-0 max-lg:z-40' : 'max-lg:hidden'} flex w-80 shrink-0 flex-col border-l max-lg:w-[min(20rem,90vw)] max-lg:shadow-2xl`}
          style={{ borderColor: 'var(--sonora-line)', background: 'var(--sonora-panel)' }}
          aria-label="SONORA AI"
        >
          <div className="border-b p-4" style={{ borderColor: 'var(--sonora-line)' }}>
            <div className="font-display text-xl font-semibold uppercase tracking-wide">
              Sonora <span style={{ color: 'var(--sonora-ai)' }}>AI</span>
            </div>
            <div className="eyebrow mt-0.5" style={{ color: 'var(--sonora-ai)' }}>Action agent · not a chatbot</div>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-auto p-3">
            {messages.length === 0 && (
              <div className="space-y-2">
                <p className="text-sm" style={{ color: 'var(--sonora-muted)' }}>Ask anything about your music…</p>
                {['analyze my library', 'play something for focus', 'find my most played genre'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => { void ask(s); setInput(''); }}
                    className="btn-ghost block w-full rounded-lg px-3 py-2 text-left text-sm"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => (
              <div
                key={m.id}
                className="rounded-xl border p-2.5 text-sm leading-relaxed"
                style={m.role === 'user'
                  ? { borderColor: 'color-mix(in srgb, var(--sonora-ai) 40%, transparent)', background: 'color-mix(in srgb, var(--sonora-ai) 10%, transparent)' }
                  : { borderColor: 'var(--sonora-line)', background: 'color-mix(in srgb, var(--sonora-text) 3%, transparent)' }}
              >
                {m.content}
              </div>
            ))}
          </div>
          <form className="flex gap-2 border-t p-3" style={{ borderColor: 'var(--sonora-line)' }} onSubmit={(e) => { e.preventDefault(); if (input.trim()) { void ask(input); setInput(''); } }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask anything about your music…"
              aria-label="Ask SONORA AI"
              className="min-w-0 flex-1 rounded-full border bg-transparent px-4 py-2 text-sm"
              style={{ borderColor: 'var(--sonora-line-strong)', background: 'color-mix(in srgb, var(--sonora-text) 5%, transparent)' }}
            />
            <button className="rounded-full px-4 font-semibold text-white transition-opacity disabled:opacity-50" style={{ background: 'var(--sonora-ai)' }} disabled={busy} aria-label="Send">
              {busy ? '…' : '➤'}
            </button>
          </form>
        </aside>
      )}

      {palette && (
        <div className="fixed inset-0 p-8" style={{ background: 'color-mix(in srgb, var(--sonora-bg) 80%, black)' }} onClick={() => setPalette(false)} role="dialog" aria-label="Command palette">
          <div className="card mx-auto max-w-lg p-4" onClick={(e) => e.stopPropagation()}>
            <div className="eyebrow mb-2">Command · Ctrl K</div>
            <input
              autoFocus
              placeholder="Type a command: play, search, create playlist…"
              aria-label="Command palette"
              className="w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
              style={{ borderColor: 'var(--sonora-line-strong)', background: 'color-mix(in srgb, var(--sonora-text) 5%, transparent)' }}
              onKeyDown={(e) => { if (e.key === 'Enter') { nav('/search'); setPalette(false); } if (e.key === 'Escape') setPalette(false); }}
            />
            <p className="mt-2 font-mono text-[11px]" style={{ color: 'var(--sonora-dim)' }}>Enter → Search · Esc → Close</p>
          </div>
        </div>
      )}
    </div>
  );
}
