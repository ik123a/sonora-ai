import { useLibrary } from '../stores/useLibrary';

export async function lyricsFor(trackId: string): Promise<{ text: string; synced: boolean }> {
  const t = useLibrary.getState().tracks.find((x) => x.id === trackId);
  if (t?.lyrics) return { text: t.lyrics, synced: false };
  return { text: 'No embedded lyrics found. Connect a lyrics provider or edit metadata to add lyrics.', synced: false };
}
