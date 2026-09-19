import { useState } from 'react';
import { loadProviders, saveProviders, testConnection } from '../ai/providers';
import type { AIProviderConfig } from '../types';
import { nanoid } from 'nanoid';

export function Settings() {
  const [providers, setProviders] = useState<AIProviderConfig[]>(() => loadProviders());
  const [detail, setDetail] = useState('');

  function persist(next: AIProviderConfig[]): void {
    setProviders(next);
    saveProviders(next);
  }

  async function test(p: AIProviderConfig): Promise<void> {
    const r = await testConnection(p);
    setDetail(`${p.name}: ${r.ok ? 'OK' : 'FAILED'} — ${r.detail}`);
  }

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Settings → AI &amp; API Providers</h1>
      <p className="text-sm text-gray-400">Keys stay in your browser/Tauri storage and are never logged. Prefer OS keychain in packaged builds.</p>
      <div className="space-y-2">
        {providers.map((p) => (
          <div key={p.id} className="rounded-xl bg-white/5 p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{p.name} · {p.model} {p.isDefault && <span className="text-xs text-violet-300">(default)</span>}</div>
              <div className="flex gap-2 text-xs">
                <button className="rounded border border-white/20 px-2 py-1" onClick={() => void test(p)}>Test</button>
                <button className="rounded border border-white/20 px-2 py-1" onClick={() => persist(providers.map((x) => ({ ...x, isDefault: x.id === p.id })))}>Default</button>
                <button className="rounded border border-red-500/50 px-2 py-1" onClick={() => persist(providers.filter((x) => x.id !== p.id))}>Delete</button>
              </div>
            </div>
            <div className="mt-1 truncate text-xs text-gray-400">{p.baseUrl}</div>
          </div>
        ))}
      </div>
      <button className="rounded bg-violet-600 px-4 py-2 text-sm" onClick={() => persist([...providers, {
        id: nanoid(), name: 'OpenRouter', apiKey: '', baseUrl: 'https://openrouter.ai/api/v1',
        model: 'meta-llama/llama-3-8b-instruct', isDefault: providers.length === 0, kind: 'openai-compatible',
      }])}>Add OpenRouter provider</button>
      <button className="rounded border border-white/20 px-4 py-2 text-sm" onClick={() => persist([...providers, {
        id: nanoid(), name: 'Ollama (local)', apiKey: '', baseUrl: 'http://localhost:11434/v1',
        model: 'llama3', isDefault: providers.length === 0, kind: 'ollama',
      }])}>Add Ollama local</button>
      {detail && <p className="text-sm text-gray-300">{detail}</p>}
      <div className="text-xs text-gray-500">Env fallback: OPENAI_API_KEY, ANTHROPIC_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY. See .env.example.</div>
    </div>
  );
}
