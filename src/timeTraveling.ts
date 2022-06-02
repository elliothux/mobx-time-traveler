import { action, computed, observable, IObservableValue } from 'mobx';
import { RestoreCallback, Snapshots } from './types';
import { ignoreStoreFields, recordedStores, restoreSnapshot } from './record';
import { dehydrate } from './hydrate';
import { config } from './configure';

export class TimeTraveler {
  @observable
  private stacks: IObservableValue<Snapshots>[] = [];

  @observable
  private cursor = 0;

  private lastUpdate = 0;

  public getSnapshots = (store: string, method: string, payload?: Record<string, any>): Snapshots => {
    return Object.entries(recordedStores).reduce<Snapshots>(
      (accu, [k, v]) => {
        accu.records[k] = dehydrate(v, ignoreStoreFields[k]);
        return accu;
      },
      { store, method, payload, records: {} },
    );
  };

  private hasInitSnapshots = false;

  @action
  public initSnapshots = (payload?: Record<string, any>, snapshots?: Snapshots) => {
    if (this.hasInitSnapshots) {
      return;
    }
    this.hasInitSnapshots = true;
    const item = snapshots || this.getSnapshots('TimeTraveler', 'initSnapshots', payload);

    this.stacks = [observable.box(item, { deep: false })];
    this.cursor = 0;
  };

  @action
  public updateSnapshots = (store: string, method: string, payload?: Record<string, any>, snapshots?: Snapshots) => {
    const { stacks, cursor } = this;
    const item = snapshots || this.getSnapshots(store, method, payload);

    if (cursor < stacks.length - 1) {
      stacks.splice(cursor + 1, stacks.length - cursor);
    }

    const boxedItem = observable.box(item, { deep: false });
    const debounce = Date.now() - this.lastUpdate < config.debounceTime;
    if (debounce) {
      stacks[stacks.length - 1] = boxedItem;
    } else {
      stacks.push(boxedItem);
    }

    if (stacks.length > config.maxStacks) {
      stacks.splice(0, config.maxStacks - stacks.length - 1);
    }

    this.cursor = stacks.length - 1;
    this.lastUpdate = Date.now();
  };

  @computed
  public get canUndo() {
    const { stacks, cursor } = this;
    return stacks.length > 1 && 0 < cursor && cursor < stacks.length;
  }

  @computed
  public get canRedo() {
    const { stacks, cursor } = this;
    return stacks.length > 1 && 0 <= cursor && cursor < stacks.length - 1;
  }

  @action
  public undo = () => {
    const { stacks, cursor } = this;
    if (!this.canUndo) {
      return;
    }
    const currentSnapshots = stacks[cursor].get();
    const snapshots = stacks[cursor - 1].get();
    this.cursor -= 1;
    return restoreSnapshot(snapshots, () => {
      this.restoreCallbacks.forEach((callback) => callback('undo', snapshots, currentSnapshots));
    });
  };

  @action
  public redo = () => {
    const { stacks, cursor } = this;
    if (!this.canRedo) {
      return;
    }
    const currentSnapshots = stacks[cursor].get();
    const snapshots = stacks[cursor + 1].get();
    this.cursor += 1;
    return restoreSnapshot(snapshots, () => {
      this.restoreCallbacks.forEach((callback) => callback('redo', snapshots, currentSnapshots));
    });
  };

  private readonly restoreCallbacks: RestoreCallback[] = [];

  public onRestore = <T extends object = Record<string, any>>(callback: RestoreCallback<T>) => {
    if (!this.restoreCallbacks.includes(callback)) {
      this.restoreCallbacks.push(callback);
    }

    return () => {
      const index = this.restoreCallbacks.findIndex((i) => i === callback);
      this.restoreCallbacks.splice(index, 1);
    };
  };
}

export const timeTraveler = new TimeTraveler();
