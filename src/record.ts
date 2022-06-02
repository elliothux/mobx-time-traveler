import { Snapshots } from './types';
import { runInAction } from 'mobx';

export const recordedStores: Snapshots['records'] = {};

export const ignoreStoreFields: {
  [name: string]: { [key: string]: true };
} = {};

export function recordStoreHistory(states: Snapshots['records']) {
  return Object.assign(recordedStores, states);
}

export function ignoreStoreField(store: string, key: string) {
  if (!ignoreStoreFields[store]) {
    ignoreStoreFields[store] = { [key]: true };
  } else {
    ignoreStoreFields[store][key] = true;
  }
}

export function restoreSnapshot({ records }: Snapshots, callback?: Function) {
  return runInAction(() => {
    Object.entries(records).forEach(([key, v]) => {
      Object.assign(recordedStores[key], v);
    });
    callback?.();
  });
}
