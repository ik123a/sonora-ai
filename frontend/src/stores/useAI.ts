import { create } from 'zustand';
import { runAgent, type AgentMessage } from '../ai/agent';

interface AIState {
  messages: Array<AgentMessage & { id: string }>;
  busy: boolean;
  ask: (text: string) => Promise<void>;
}

let n = 0;

export const useAI = create<AIState>((set, get) => ({
  messages: [],
  busy: false,
  ask: async (text) => {
    if (get().busy) return;
    set((s) => ({ busy: true, messages: [...s.messages, { id: `u${++n}`, role: 'user', content: text }] }));
    try {
      const reply = await runAgent(text, (m) => set((s) => ({ messages: [...s.messages, { ...m, id: `t${++n}` }] })));
      set((s) => ({ messages: [...s.messages, { id: `a${++n}`, role: 'assistant', content: reply }] }));
    } finally { set({ busy: false }); }
  },
}));
