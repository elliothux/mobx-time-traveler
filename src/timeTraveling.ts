import { action, computed, observable } from 'mobx';
import { Snapshots } from './types';
import { recordedStores, restoreSnapshot } from './record';
import { dehydrate } from './hydrate';

export class TimeTraveler {
  @observable
  private stacks: Snapshots[] = [];

  @observable
  private cursor = 0;

  public getSnapshots = (): Snapshots => {
    return Object.entries(recordedStores).reduce<Snapshots>((accu, [k, v]) => {
      accu[k] = dehydrate(v);
      return accu;
    }, {});
  };

  @action
  public initSnapshots = (snapshots?: Snapshots) => {
    this.stacks = [snapshots || this.getSnapshots()];
    this.cursor = 0;
  };

  @action
  public updateSnapshots = (snapshots?: Snapshots) => {
    const { stacks } = this;
    stacks.push(snapshots || this.getSnapshots());
    this.cursor = stacks.length - 1;
  };

  @computed
  public get canUndo() {
    return this.stacks.length > 1 && this.cursor > 0;
  }

  @computed
  public get canRedo() {
    return this.stacks.length > 1 && this.cursor < this.stacks.length;
  }

  @action
  public undo = () => {
    const { stacks, cursor } = this;
    if (!this.canUndo) {
      return;
    }
    const snapshot = stacks[cursor - 1];
    this.cursor -= 1;
    return restoreSnapshot(snapshot);
  };

  @action
  public redo = () => {
    const { stacks, cursor } = this;
    if (!this.canRedo) {
      return;
    }
    const snapshot = stacks[cursor + 1];
    this.cursor -= 1;
    return restoreSnapshot(snapshot);
  };
}

export const timeTraveler = new TimeTraveler();
