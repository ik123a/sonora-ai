import { useLocation } from 'react-router-dom';

export function Stub() {
  const loc = useLocation();
  return (
    <div className="space-y-2">
      <h1 className="text-2xl font-bold capitalize">{loc.pathname.replace('/', '') || 'Home'}</h1>
      <p className="text-sm text-gray-400">This section is wired into Phase 2–4 work. Library, player and AI tools already function; richer views land incrementally without breaking this shell.</p>
    </div>
  );
}
