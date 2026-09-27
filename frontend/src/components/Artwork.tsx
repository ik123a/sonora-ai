import { useMemo } from 'react';

/**
 * Album art with a deterministic fallback.
 *
 * A music app's identity lives in its covers, but plenty of tracks (and most
 * provider results) have no embedded image. Rendering a bare empty square reads
 * as a broken layout, so the fallback is a hue-stable identicon derived from
 * the track/album name — same album always gets the same mark.
 */

function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

interface Props {
  src?: string;
  seed: string;
  alt: string;
  className?: string;
  rounded?: string;
}

export function Artwork({ src, seed, alt, className = '', rounded = 'rounded-lg' }: Props) {
  const ident = useMemo(() => {
    const h = hash(seed || 'sonora');
    const hue = h % 360;
    const a = 18 + (h % 22); // bar count
    const bars = Array.from({ length: 7 }, (_, i) => {
      const v = hash(`${seed}:${i}`) % 100;
      return { x: i * 14 + 6, h: 26 + (v % 62), o: 0.28 + ((v % 40) / 100) };
    });
    return { hue, a, bars };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seed]);

  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        loading="lazy"
        decoding="async"
        className={`${className} ${rounded} bg-white/5 object-cover`}
      />
    );
  }

  return (
    <div
      role="img"
      aria-label={alt}
      className={`${className} ${rounded} relative overflow-hidden`}
      style={{
        background: `linear-gradient(150deg, hsl(${ident.hue} 34% 15%), hsl(${(ident.hue + 40) % 360} 30% 9%))`,
      }}
    >
      <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
        {ident.bars.map((b, i) => (
          <rect
            key={i}
            x={b.x}
            y={100 - b.h}
            width="8"
            height={b.h}
            rx="4"
            fill={`hsl(${ident.hue} 62% 58%)`}
            opacity={b.o}
          />
        ))}
      </svg>
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 text-center font-mono text-[9px] uppercase tracking-[0.2em] text-white/45"
      >
        no art
      </span>
    </div>
  );
}
