import type { ReactNode } from 'react';
import { Artwork } from './Artwork';

/**
 * Cover-art-first tile. Artwork is the primary object and the caption hangs
 * beneath it, rather than the old text-on-grey-box card.
 */
export function Tile({
  src,
  seed,
  title,
  meta,
  onClick,
  aspect = 'square',
}: {
  src?: string;
  seed: string;
  title: string;
  meta?: ReactNode;
  onClick?: () => void;
  aspect?: 'square' | 'circle';
}) {
  return (
    <button type="button" onClick={onClick} className="tile group">
      <Artwork
        src={src}
        seed={seed}
        alt={title}
        rounded={aspect === 'circle' ? 'rounded-full' : 'rounded-xl'}
        className={`w-full transition-transform duration-200 ease-out ${aspect === 'circle' ? 'aspect-square' : 'aspect-square'} group-hover:-translate-y-1`}
      />
      <div className="caption">
        <div className="title transition-colors group-hover:text-[var(--sonora-accent)]">{title}</div>
        {meta ? <div className="meta">{meta}</div> : null}
      </div>
    </button>
  );
}

/** Numbered track row, metadata set in mono like a setlist. */
export function TrackRow({
  index,
  title,
  artist,
  album,
  duration,
  artworkUrl,
  liked,
  onToggleLike,
  onPlay,
  right,
}: {
  index: number;
  title: string;
  artist: string;
  album?: string;
  duration?: number;
  artworkUrl?: string;
  liked?: boolean;
  onToggleLike?: () => void;
  onPlay: () => void;
  right?: ReactNode;
}) {
  return (
    <div className="row group">
      <span className="idx" aria-hidden>{String(index + 1).padStart(2, '0')}</span>
      <Artwork
        src={artworkUrl}
        seed={`${title}-${artist}`}
        alt=""
        rounded="rounded-md"
        className="h-9 w-9 shrink-0"
      />
      <button type="button" onClick={onPlay} className="min-w-0 flex-1 text-left">
        <span className="block truncate text-sm font-medium">{title}</span>
        <span className="block truncate text-xs" style={{ color: 'var(--sonora-muted)' }}>
          {artist}{album ? ` · ${album}` : ''}
        </span>
      </button>
      {onToggleLike ? (
        <button
          type="button"
          onClick={onToggleLike}
          aria-label={liked ? `Unlike ${title}` : `Like ${title}`}
          aria-pressed={!!liked}
          className="rounded-full p-2 text-lg leading-none transition-colors"
          style={{ color: liked ? 'var(--sonora-accent)' : 'var(--sonora-dim)' }}
        >
          {liked ? '♥' : '♡'}
        </button>
      ) : null}
      {right}
      <span className="dur" aria-label="Duration">
        {duration ? `${Math.floor(duration / 60)}:${String(Math.round(duration % 60)).padStart(2, '0')}` : '—'}
      </span>
    </div>
  );
}

export function PageHead({ title, count }: { title: string; count?: number | string }) {
  return (
    <h1 className="page-head">
      {title}
      {count !== undefined ? <span className="count">{count}</span> : null}
    </h1>
  );
}
