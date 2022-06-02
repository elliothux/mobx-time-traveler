export type Snapshots<T extends object = Record<string, any>> = {
  store?: string;
  method?: string;
  payload?: T;
  records: {
    [key: string]: object;
  };
};

export interface TimeTravelerConfig {
  maxStacks: number;
  debounceTime: number;
}

export type RestoreCallback<T extends object = Record<string, any>> = (
  type: 'undo' | 'redo',
  nextSnapshots: Snapshots<T>,
  currentSnapshots: Snapshots<T>,
) => void | Promise<void>;
