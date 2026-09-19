import type { PermissionLevel, ToolResult } from '../types';
import { useLibrary } from '../stores/useLibrary';
import { usePlayer } from '../stores/usePlayer';
import { usePlaylists } from '../stores/usePlaylists';
import { recommend } from './recommendations';
import { EQ_PRESETS, engine } from '../audio/engine';

export interface ToolDef {
  name: string;
  description: string;
  permission: PermissionLevel;
  dangerous: boolean;
  run: (args: Record<string, unknown>) => Promise<ToolResult>;
}

function ok(message: string, data?: unknown): ToolResult { return { success: true, message, data }; }
function fail(message: string): ToolResult { return { success: false, message }; }

export const tools: ToolDef[] = [
  { name: 'search_library', description: 'Search local library', permission: 'READ', dangerous: false,
    run: async (a) => ok('Search complete', useLibrary.getState().tracks.filter((t) => JSON.stringify(t).toLowerCase().includes(String(a.q ?? '').toLowerCase())).slice(0, 20)) },
  { name: 'play_track', description: 'Play a track by id', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => {
      const tracks = useLibrary.getState().tracks;
      const i = tracks.findIndex((t) => t.id === a.trackId);
      if (i < 0) return fail('Track not found');
      usePlayer.getState().setQueue(tracks, i);
      return ok(`Playing ${tracks[i].title}`);
    } },
  { name: 'pause_music', description: 'Pause playback', permission: 'PLAYBACK', dangerous: false, run: async () => { usePlayer.getState().toggle(); return ok('Paused'); } },
  { name: 'skip_track', description: 'Next track', permission: 'PLAYBACK', dangerous: false, run: async () => { usePlayer.getState().next(); return ok('Skipped'); } },
  { name: 'previous_track', description: 'Previous track', permission: 'PLAYBACK', dangerous: false, run: async () => { usePlayer.getState().prev(); return ok('Went back'); } },
  { name: 'set_volume', description: 'Set volume 0-1', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => { usePlayer.getState().setVolume(Number(a.volume ?? 0.9)); return ok('Volume updated'); } },
  { name: 'get_current_track', description: 'Current track', permission: 'READ', dangerous: false,
    run: async () => ok('Current track', usePlayer.getState().currentTrack) },
  { name: 'get_queue', description: 'Current queue', permission: 'READ', dangerous: false,
    run: async () => ok('Queue', usePlayer.getState().queue) },
  { name: 'like_song', description: 'Like a track', permission: 'PLAYLIST', dangerous: false,
    run: async (a) => { useLibrary.getState().toggleLike(String(a.trackId)); return ok('Liked'); } },
  { name: 'unlike_song', description: 'Unlike a track', permission: 'PLAYLIST', dangerous: false,
    run: async (a) => { useLibrary.getState().toggleLike(String(a.trackId)); return ok('Unliked'); } },
  { name: 'resume_music', description: 'Resume playback', permission: 'PLAYBACK', dangerous: false, run: async () => { usePlayer.getState().toggle(); return ok('Resumed'); } },
  { name: 'seek', description: 'Seek seconds', permission: 'PLAYBACK', dangerous: false, run: async (a) => { usePlayer.getState().seek(Number(a.seconds ?? 0)); return ok('Seeked'); } },
  { name: 'shuffle', description: 'Set shuffle', permission: 'PLAYBACK', dangerous: false, run: async (a) => { usePlayer.getState().setShuffle(Boolean(a.on)); return ok('Shuffle updated'); } },
  { name: 'set_repeat_mode', description: 'off/all/one', permission: 'PLAYBACK', dangerous: false, run: async (a) => { usePlayer.getState().setRepeat((a.mode as 'off' | 'all' | 'one') ?? 'off'); return ok('Repeat updated'); } },
  { name: 'play_random', description: 'Shuffle entire library', permission: 'PLAYBACK', dangerous: false,
    run: async () => { const t = useLibrary.getState().tracks; if (!t.length) return fail('Library empty'); usePlayer.getState().setShuffle(true); usePlayer.getState().setQueue(t, Math.floor(Math.random() * t.length)); return ok('Shuffled library'); } },
  { name: 'play_by_genre', description: 'Play genre', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => { const t = useLibrary.getState().tracks.filter((x) => (x.genre ?? '').toLowerCase().includes(String(a.genre ?? '').toLowerCase())); if (!t.length) return fail('No tracks for genre'); usePlayer.getState().setQueue(t, 0); return ok(`Playing ${t.length} ${a.genre} tracks`); } },
  { name: 'play_by_year', description: 'Play year/decade', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => { const y = Number(a.year ?? 0); const t = useLibrary.getState().tracks.filter((x) => x.year === y || (y < 100 && x.year !== undefined && Math.floor(x.year / 10) * 10 === y)); if (!t.length) return fail('No tracks for year'); usePlayer.getState().setQueue(t, 0); return ok(`Playing ${t.length} tracks`); } },
  { name: 'play_downloaded_music', description: 'Play local/offline only', permission: 'PLAYBACK', dangerous: false,
    run: async () => { const t = useLibrary.getState().tracks.filter((x) => x.source !== 'provider'); if (!t.length) return fail('No offline tracks'); usePlayer.getState().setQueue(t, 0); return ok(`Playing ${t.length} offline tracks`); } },
  { name: 'add_to_queue', description: 'Append track to queue', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => { const p = usePlayer.getState(); const t = useLibrary.getState().tracks.find((x) => x.id === a.trackId); if (!t) return fail('Track not found'); p.setQueue([...p.queue, t], p.queue.length ? 0 : 0); return ok('Added to queue'); } },
  { name: 'clear_queue', description: 'Clear queue', permission: 'PLAYBACK', dangerous: false, run: async () => { usePlayer.getState().setQueue([], 0); return ok('Queue cleared'); } },
  { name: 'create_playlist', description: 'Create playlist from track ids', permission: 'PLAYLIST', dangerous: false,
    run: async (a) => { const p = usePlaylists.getState().create(String(a.name ?? 'New playlist'), (a.trackIds as string[]) ?? []); return ok(`Created ${p.name}`, { playlistId: p.id }); } },
  { name: 'delete_playlist', description: 'Delete playlist (confirm)', permission: 'PLAYLIST', dangerous: true,
    run: async (a) => { if (!a.confirmed) return fail('Confirmation required: pass confirmed=true'); usePlaylists.getState().remove(String(a.playlistId)); return ok('Deleted'); } },
  { name: 'rename_playlist', description: 'Rename playlist', permission: 'PLAYLIST', dangerous: false, run: async (a) => { usePlaylists.getState().rename(String(a.playlistId), String(a.name)); return ok('Renamed'); } },
  { name: 'add_to_playlist', description: 'Add tracks to playlist', permission: 'PLAYLIST', dangerous: false, run: async (a) => { usePlaylists.getState().addTracks(String(a.playlistId), (a.trackIds as string[]) ?? []); return ok('Added'); } },
  { name: 'remove_from_playlist', description: 'Remove track', permission: 'PLAYLIST', dangerous: false, run: async (a) => { usePlaylists.getState().removeTrack(String(a.playlistId), String(a.trackId)); return ok('Removed'); } },
  { name: 'play_playlist', description: 'Play playlist', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => { const p = usePlaylists.getState().playlists.find((x) => x.id === a.playlistId); if (!p) return fail('Playlist not found'); const byId = new Map(useLibrary.getState().tracks.map((t) => [t.id, t])); const list = p.trackIds.map((id) => byId.get(id)).filter((x) => x !== undefined); usePlayer.getState().setQueue(list, 0); return ok(`Playing ${p.name}`); } },
  { name: 'create_smart_playlist', description: 'Smart playlist by rules', permission: 'PLAYLIST', dangerous: false,
    run: async (a) => { const p = usePlaylists.getState().createSmart(String(a.name ?? 'Smart'), (a.rules as never[]) ?? []); return ok(`Created smart playlist ${p.name}`, { playlistId: p.id }); } },
  { name: 'find_similar', description: 'Tracks similar to seed', permission: 'READ', dangerous: false, run: async (a) => ok('Similar tracks', recommend(String(a.trackId ?? ''), 10)) },
  { name: 'recommend_music', description: 'Recommend N tracks', permission: 'READ', dangerous: false, run: async (a) => ok('Recommendations', recommend(usePlayer.getState().currentTrack?.id, Number(a.limit ?? 10))) },
  { name: 'show_lyrics', description: 'Lyrics for track', permission: 'READ', dangerous: false,
    run: async (a) => { const t = useLibrary.getState().tracks.find((x) => x.id === (a.trackId ?? usePlayer.getState().currentTrack?.id)); return ok('Lyrics', t?.lyrics ?? null); } },
  { name: 'show_history', description: 'Most played', permission: 'READ', dangerous: false,
    run: async () => ok('History', [...useLibrary.getState().tracks].sort((a, b) => (b.playCount ?? 0) - (a.playCount ?? 0)).slice(0, 10)) },
  { name: 'change_equalizer', description: 'EQ preset', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => { const g = EQ_PRESETS[String(a.preset ?? 'Flat')] ?? EQ_PRESETS.Flat; engine.setEQ([...g], 0); return ok(`EQ → ${a.preset}`); } },
  { name: 'set_sleep_timer', description: 'Stop playback after N minutes (0 cancels)', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => {
      const mod = await import('../stores/useSleep');
      const min = Number(a.minutes ?? 0);
      if (min <= 0) { mod.useSleep.getState().cancel(); return ok('Sleep timer cancelled'); }
      mod.useSleep.getState().setMinutes(min);
      return ok(`Sleep timer set: ${min} minutes`);
    } },
  { name: 'start_radio', description: 'Build Smart Radio queue from current taste and play it', permission: 'PLAYBACK', dangerous: false,
    run: async (a) => {
      const { buildRadio } = await import('./recommendations');
      const { usePlayer } = await import('../stores/usePlayer');
      const picks = buildRadio(usePlayer.getState().currentTrack?.id, Number(a.limit ?? 25)).map((r) => r.track);
      if (!picks.length) return fail('Library empty — import music first');
      usePlayer.getState().setQueue(picks, 0);
      return ok(`Smart Radio playing: ${picks.length} tracks`, { count: picks.length });
    } },
  { name: 'analyze_library', description: 'Top artists/genres/stats', permission: 'READ', dangerous: false,
    run: async () => {
      const tracks = useLibrary.getState().tracks;
      const byArtist = new Map<string, number>();
      const byGenre = new Map<string, number>();
      for (const t of tracks) {
        byArtist.set(t.artist, (byArtist.get(t.artist) ?? 0) + 1);
        if (t.genre) byGenre.set(t.genre, (byGenre.get(t.genre) ?? 0) + 1);
      }
      return ok('Analysis complete', {
        total: tracks.length,
        topArtists: [...byArtist.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
        topGenres: [...byGenre.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10),
      });
    } },
];

export function getTool(name: string): ToolDef | undefined { return tools.find((t) => t.name === name); }
