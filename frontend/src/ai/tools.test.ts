import { afterEach, describe, expect, it, vi } from 'vitest';
import { getTool, tools } from '../ai/tools';
import { usePlayer } from '../stores/usePlayer';
import { engine } from '../audio/engine';

describe('agent tools', () => {
  it('exposes playback + playlist + read tools', () => {
    expect(tools.length).toBeGreaterThan(20);
    for (const name of ['search_library', 'play_track', 'create_playlist', 'recommend_music', 'show_history']) {
      expect(getTool(name)).toBeDefined();
    }
  });
  it('dangerous tools need confirmation', async () => {
    const res = await getTool('delete_playlist')!.run({ playlistId: 'x' });
    expect(res.success).toBe(false);
  });
});

describe('explicit playback commands', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    usePlayer.setState({ currentTrack: null, isPlaying: false });
  });
  const track = { id: 'synthetic', title: 'Test', artist: 'Test', album: 'Test', duration: 1,
    source: 'local' as const, addedAt: 0 };
  it('pause is idempotent when already paused', async () => {
    vi.spyOn(engine, 'resume').mockResolvedValue();
    usePlayer.setState({ currentTrack: track, isPlaying: false });
    await getTool('pause_music')!.run({});
    expect(usePlayer.getState().isPlaying).toBe(false);
  });
  it('resume is idempotent when already playing', async () => {
    vi.spyOn(engine, 'pause').mockImplementation(() => undefined);
    usePlayer.setState({ currentTrack: track, isPlaying: true });
    await getTool('resume_music')!.run({});
    expect(usePlayer.getState().isPlaying).toBe(true);
  });
});