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
