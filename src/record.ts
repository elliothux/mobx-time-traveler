import { runInAction } from 'mobx';
import { Snapshots } from './types';

export const recordedStores: Snapshots = {};

export function recordStoreHistory(states: Snapshots) {
  return Object.assign(recordedStores, states);
}

export function restoreSnapshot(snapshot: Snapshots) {
  return runInAction(() => {
    Object.entries(snapshot).forEach(([key, v]) => {
      Object.assign(recordedStores[key], v);
    });
  });
}
