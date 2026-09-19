import { useState } from 'react';

interface Job { id: string; label: string; status: 'queued' | 'done' | 'failed'; detail: string; }

export function Downloads() {
  const [jobs] = useState<Job[]>([]);
  return (
    <div className="max-w-2xl space-y-3">
      <h1 className="text-2xl font-bold">Downloads</h1>
      <p className="text-sm text-gray-400">Only user-owned files and provider-authorized offline tracks. No DRM bypass. Local imports are already offline.</p>
      {jobs.length === 0 && <p className="text-sm text-gray-400">Nothing queued. Quality: Original / High / Medium / Low applies when a provider grants a download URL.</p>}
    </div>
  );
}
