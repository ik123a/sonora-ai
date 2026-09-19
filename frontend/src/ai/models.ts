export const TASK_MODELS = ['general', 'playlist', 'voice', 'analysis', 'recommendations'] as const;
export type TaskKind = (typeof TASK_MODELS)[number];

export const MODEL_CATALOG: Record<string, string[]> = {
  'openai-compatible': ['gpt-4o-mini', 'gpt-4o', 'llama-3-8b-instruct'],
  anthropic: ['claude-3-5-sonnet', 'claude-3-haiku'],
  gemini: ['gemini-1.5-flash', 'gemini-1.5-pro'],
  ollama: ['llama3', 'mistral', 'qwen2'],
  lmstudio: ['local-model'],
  custom: ['custom-model'],
};
