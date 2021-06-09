export interface Snapshots {
  [key: string]: object;
}

export interface TimeTravelerConfig {
  maxStacks: number;
}

export type RestoreCallback = (type: 'undo' | 'redo', snapshots: Snapshots) => void | Promise<void>;
