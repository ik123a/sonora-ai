import { describe, expect, it } from 'vitest';
import { detectProviderFromKey, fetchModels } from '../ai/providers';

describe('provider key detection', () => {
  it('detects anthropic, gemini, groq, openrouter, openai', () => {
    expect(detectProviderFromKey('sk-ant-abc').kind).toBe('anthropic');
    expect(detectProviderFromKey('AIza123').kind).toBe('gemini');
    expect(detectProviderFromKey('gsk_123').name).toBe('Groq');
    expect(detectProviderFromKey('sk-or-123').name).toBe('OpenRouter');
    expect(detectProviderFromKey('sk-123').name).toBe('OpenAI');
  });
  it('fetchModels requires a base url', async () => {
    await expect(fetchModels({ id: 'x', name: 'Custom', apiKey: '', baseUrl: '', model: '', isDefault: false, kind: 'custom' }))
      .rejects.toThrow('Base URL');
  });
});
