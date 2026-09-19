import { describe, expect, it } from 'vitest';
import { activeLineIndex, parseLRC } from '../services/lyrics';

describe('lrc', () => {
  it('parses mm:ss.cc lines in order', () => {
    const lines = parseLRC('[00:12.00]Hello\n[00:10.00]Intro\n[01:02.500]Late');
    expect(lines.map((l) => l.text)).toEqual(['Intro', 'Hello', 'Late']);
    expect(lines[0].time).toBeCloseTo(10);
    expect(lines[2].time).toBeCloseTo(62.5);
  });
  it('finds the active line', () => {
    const lines = parseLRC('[00:10.00]A\n[00:20.00]B');
    expect(activeLineIndex(lines, 5)).toBe(-1);
    expect(activeLineIndex(lines, 15)).toBe(0);
    expect(activeLineIndex(lines, 25)).toBe(1);
  });
});
