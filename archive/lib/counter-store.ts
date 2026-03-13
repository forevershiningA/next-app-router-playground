import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  setCount: (count: number) => void;
}

export const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  setCount: (count) => set({ count }),
}));
