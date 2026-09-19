import type { AIProviderConfig } from '../types';

const KEY = 'sonora.ai.providers.v1';

export function loadProviders(): AIProviderConfig[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    return JSON.parse(raw) as AIProviderConfig[];
  } catch { return []; }
}

export function saveProviders(all: AIProviderConfig[]): void {
  localStorage.setItem(KEY, JSON.stringify(all.map((p) => ({ ...p, apiKey: p.apiKey }))));
}

export function defaultProvider(all: AIProviderConfig[]): AIProviderConfig | undefined {
  return all.find((p) => p.isDefault) ?? all[0];
}

export interface DetectedProvider { kind: AIProviderConfig['kind']; name: string; baseUrl: string; }

export function detectProviderFromKey(key: string): DetectedProvider {
  const k = key.trim();
  if (k.startsWith('sk-ant-')) return { kind: 'anthropic', name: 'Anthropic', baseUrl: 'https://api.anthropic.com' };
  if (k.startsWith('AIza')) return { kind: 'gemini', name: 'Google Gemini', baseUrl: 'https://generativelanguage.googleapis.com' };
  if (k.startsWith('gsk_')) return { kind: 'openai-compatible', name: 'Groq', baseUrl: 'https://api.groq.com/openai/v1' };
  if (k.startsWith('mistral-') || k.startsWith('mistral_')) return { kind: 'openai-compatible', name: 'Mistral', baseUrl: 'https://api.mistral.ai/v1' };
  if (k.startsWith('together-') || k.startsWith('tgp_')) return { kind: 'openai-compatible', name: 'Together AI', baseUrl: 'https://api.together.xyz/v1' };
  if (k.startsWith('sk-or-')) return { kind: 'openai-compatible', name: 'OpenRouter', baseUrl: 'https://openrouter.ai/api/v1' };
  if (k.startsWith('nvapi-')) return { kind: 'openai-compatible', name: 'NVIDIA NIM', baseUrl: 'https://integrate.api.nvidia.com/v1' };
  if (k.startsWith('sk-')) return { kind: 'openai-compatible', name: 'OpenAI', baseUrl: 'https://api.openai.com/v1' };
  return { kind: 'openai-compatible', name: 'Custom endpoint', baseUrl: '' };
}

export async function fetchModels(p: AIProviderConfig): Promise<string[]> {
  const base = p.baseUrl.replace(/\/$/, '');
  if (!base) throw new Error('Set the Base URL first, then fetch models.');
  if (p.kind === 'ollama') {
    const root = base.replace(/\/v1$/, '');
    const res = await fetch(`${root}/api/tags`);
    if (!res.ok) throw new Error(`Ollama HTTP ${res.status} — is Ollama running?`);
    const json = await res.json() as { models?: Array<{ name?: string }> };
    return (json.models ?? []).map((m) => m.name ?? '').filter(Boolean);
  }
  if (p.kind === 'anthropic') {
    const res = await fetch(`${base}/v1/models`, { headers: { 'x-api-key': p.apiKey, 'anthropic-version': '2023-06-01' } });
    if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
    const json = await res.json() as { data?: Array<{ id?: string }> };
    return (json.data ?? []).map((m) => m.id ?? '').filter(Boolean);
  }
  if (p.kind === 'gemini') {
    const res = await fetch(`${base}/v1beta/models?key=${encodeURIComponent(p.apiKey)}`);
    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);
    const json = await res.json() as { models?: Array<{ name?: string; supportedGenerationMethods?: string[] }> };
    return (json.models ?? [])
      .filter((m) => m.supportedGenerationMethods?.includes('generateContent'))
      .map((m) => (m.name ?? '').replace(/^models\//, ''))
      .filter(Boolean);
  }
  const res = await fetch(`${base}/models`, { headers: p.apiKey ? { Authorization: `Bearer ${p.apiKey}` } : {} });
  if (!res.ok) throw new Error(`HTTP ${res.status} — check Base URL and API key.`);
  const json = await res.json() as { data?: Array<{ id?: string }> };
  return (json.data ?? []).map((m) => m.id ?? '').filter(Boolean);
}

export async function testConnection(p: AIProviderConfig): Promise<{ ok: boolean; detail: string }> {
  try {
    if (p.kind === 'ollama' || p.kind === 'lmstudio' || p.kind === 'custom' || p.kind === 'openai-compatible') {
      const base = p.baseUrl.replace(/\/$/, '');
      const res = await fetch(`${base}/models`, { headers: p.apiKey ? { Authorization: `Bearer ${p.apiKey}` } : {} });
      if (!res.ok) return { ok: false, detail: `HTTP ${res.status}` };
      return { ok: true, detail: 'Connected' };
    }
    if (!p.apiKey) return { ok: false, detail: 'Missing API key' };
    return { ok: true, detail: 'Key present (validation happens on first chat call)' };
  } catch (e) {
    return { ok: false, detail: e instanceof Error ? e.message : 'Network failure' };
  }
}

export async function chatComplete(p: AIProviderConfig, messages: Array<{ role: string; content: string }>, tools?: unknown[]): Promise<string> {
  if (p.kind === 'anthropic') {
    const res = await fetch(`${p.baseUrl.replace(/\/$/, '')}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-key': p.apiKey, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({ model: p.model, max_tokens: 1024, messages: messages.map((m) => ({ role: m.role === 'system' ? 'user' : m.role, content: m.content })) }),
    });
    if (!res.ok) throw new Error(`Anthropic HTTP ${res.status}`);
    const json = await res.json() as { content?: Array<{ text?: string }> };
    return json.content?.map((c) => c.text ?? '').join('') ?? '';
  }
  const res = await fetch(`${p.baseUrl.replace(/\/$/, '')}/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(p.apiKey ? { Authorization: `Bearer ${p.apiKey}` } : {}) },
    body: JSON.stringify({ model: p.model, messages, tools }),
  });
  if (!res.ok) throw new Error(`AI provider HTTP ${res.status}`);
  const json = await res.json() as { choices?: Array<{ message?: { content?: string } }> };
  return json.choices?.[0]?.message?.content ?? '';
}
