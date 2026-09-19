import { describe, expect, it } from 'vitest';
import { getTool, tools } from '../ai/tools';

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
