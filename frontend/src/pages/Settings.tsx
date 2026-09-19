import { useState } from 'react';
import { nanoid } from 'nanoid';
import { detectProviderFromKey, fetchModels, loadProviders, saveProviders, testConnection } from '../ai/providers';
import { MODEL_CATALOG } from '../ai/models';
import type { AIProviderConfig } from '../types';

export function Settings() {
  const [providers, setProviders] = useState<AIProviderConfig[]>(() => loadProviders());
  const [detail, setDetail] = useState('');
  const [quickKey, setQuickKey] = useState('');
  const [modelLists, setModelLists] = useState<Record<string, string[]>>({});
  const [busyId, setBusyId] = useState('');

  function persist(next: AIProviderConfig[]): void {
    setProviders(next);
    saveProviders(next);
  }

  async function test(p: AIProviderConfig): Promise<void> {
    const r = await testConnection(p);
    setDetail(`${p.name}: ${r.ok ? 'OK' : 'FAILED'} — ${r.detail}`);
  }

  async function refreshModels(p: AIProviderConfig): Promise<void> {
    setBusyId(p.id);
    try {
      const ids = await fetchModels(p);
      setModelLists((m) => ({ ...m, [p.id]: ids }));
      setDetail(ids.length ? `${p.name}: found ${ids.length} models.` : `${p.name}: no models returned — keeping typed value.`);
      if (ids.length && !ids.includes(p.model)) persist(providers.map((x) => (x.id === p.id ? { ...x, model: ids[0] } : x)));
    } catch (e) {
      setDetail(`${p.name}: model fetch failed — ${e instanceof Error ? e.message : 'network error'}`);
    } finally {
      setBusyId('');
    }
  }

  function quickAdd(): void {
    const key = quickKey.trim();
    if (!key) return;
    const d = detectProviderFromKey(key);
    const p: AIProviderConfig = {
      id: nanoid(), name: d.name, apiKey: key, baseUrl: d.baseUrl,
      model: '', isDefault: providers.length === 0, kind: d.kind,
    };
    const next = [...providers, p];
    persist(next);
    setQuickKey('');
    setDetail(d.baseUrl ? `${d.name} detected — hit “Fetch models”, pick one, then Test.` : `${d.name} — enter its Base URL below, then Fetch models.`);
    void refreshModels(p);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <div className="eyebrow">Settings · AI &amp; API providers</div>
        <h1 className="text-3xl">Connect intelligence</h1>
        <p className="mt-1 text-sm text-neutral-400">Paste a key — the provider is detected automatically and its models load from the API. Keys stay on your device, never logged.</p>
      </div>
      <div className="card flex gap-2 p-3">
        <input value={quickKey} onChange={(e) => setQuickKey(e.target.value)} type="password" placeholder="Paste API key — sk-…, sk-ant-…, AIza…, gsk_…" className="min-w-0 flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm placeholder:text-neutral-600 focus:border-[#ffb800]" aria-label="Paste API key" />
        <button className="btn-amber px-5 py-2 text-sm" onClick={quickAdd}>Add key</button>
      </div>
      <div className="space-y-3">
        {providers.map((p) => {
          const options = modelLists[p.id] ?? MODEL_CATALOG[p.kind] ?? [];
          return (
            <div key={p.id} className="card space-y-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="font-semibold">{p.name} {p.isDefault && <span className="pill ml-1 border-[#ffb800]/50 px-2 py-0.5 text-[#ffb800]">default</span>}</div>
                <div className="flex gap-2 font-mono text-[11px]">
                  <button className="pill px-3 py-1.5 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => void test(p)}>Test</button>
                  <button className="pill px-3 py-1.5 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => persist(providers.map((x) => ({ ...x, isDefault: x.id === p.id })))}>Default</button>
                  <button className="pill border-red-500/50 px-3 py-1.5 text-red-300 hover:border-red-400" onClick={() => persist(providers.filter((x) => x.id !== p.id))}>Delete</button>
                </div>
              </div>
              <label className="block text-xs text-neutral-400">Base URL
                <input value={p.baseUrl} onChange={(e) => persist(providers.map((x) => (x.id === p.id ? { ...x, baseUrl: e.target.value } : x)))} placeholder="https://… (empty for key-detected defaults)" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs" aria-label="Base URL" />
              </label>
              <label className="block text-xs text-neutral-400">API key
                <input value={p.apiKey} onChange={(e) => persist(providers.map((x) => (x.id === p.id ? { ...x, apiKey: e.target.value } : x)))} type="password" placeholder="Paste or edit key" className="mt-1 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-mono text-xs" aria-label="API key" />
              </label>
              <div className="flex gap-2">
                <label className="flex-1 text-xs text-neutral-400">Model
                  <select value={p.model} onChange={(e) => persist(providers.map((x) => (x.id === p.id ? { ...x, model: e.target.value } : x)))} className="mt-1 w-full rounded-lg border border-white/10 bg-[#17171c] px-3 py-2 text-sm text-neutral-100" aria-label="Model">
                    {p.model && !options.includes(p.model) && <option value={p.model}>{p.model}</option>}
                    {options.map((m) => <option key={m} value={m}>{m}</option>)}
                    {options.length === 0 && <option value="">Fetch models first…</option>}
                  </select>
                </label>
                <button className="pill self-end px-3 py-2 hover:border-[#ffb800] hover:text-[#ffb800]" disabled={busyId === p.id} onClick={() => void refreshModels(p)}>
                  {busyId === p.id ? 'Loading…' : modelLists[p.id] ? `Refresh (${modelLists[p.id].length})` : 'Fetch models'}
                </button>
              </div>
            </div>
          );
        })}
        {providers.length === 0 && <p className="text-sm text-neutral-500">No providers yet — paste a key above, or add Ollama local below.</p>}
      </div>
      <button className="pill px-4 py-2 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => persist([...providers, {
        id: nanoid(), name: 'Ollama (local)', apiKey: '', baseUrl: 'http://localhost:11434/v1',
        model: 'llama3', isDefault: providers.length === 0, kind: 'ollama',
      }])}>+ Add Ollama local</button>
      <button className="pill px-4 py-2 hover:border-[#ffb800] hover:text-[#ffb800]" onClick={() => persist([...providers, {
        id: nanoid(), name: 'NVIDIA NIM', apiKey: '', baseUrl: 'https://integrate.api.nvidia.com/v1',
        model: 'meta/llama-3.2-11b-vision-instruct', isDefault: providers.length === 0, kind: 'openai-compatible',
      }])}>+ Add NVIDIA NIM</button>
      {detail && <p className="text-sm text-neutral-300" role="status">{detail}</p>}
      <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-neutral-600">Env fallback: OPENAI_API_KEY · ANTHROPIC_API_KEY · GEMINI_API_KEY · OPENROUTER_API_KEY</div>
    </div>
  );
}
