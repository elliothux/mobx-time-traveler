import { action } from 'mobx';
import { timeTraveler } from './timeTraveling';
import { recordStoreHistory, recordedStores } from './record';

export const withTimeTravel = <T extends { new (...args: unknown[]): any }>(target: T): T => {
  const original = target;
  const f = function(...args: ConstructorParameters<typeof target>) {
    const { name } = original;
    if (recordedStores[name]) {
      throw new Error(
        `Store "${name}" has already been recorded. Make sure that every store has an unique class name and instantiated only once`,
      );
    }

    const instance = new original(...args);
    recordStoreHistory({ [name]: instance as object });
    return instance;
  };
  f.prototype = original.prototype;
  return f as any;
};

let updating = false;

export const withSnapshot = (target: object, propertyKey: string, descriptor?: PropertyDescriptor): void => {
  const { initializer } = descriptor as any;
  descriptor!.value = function(...args: Parameters<ReturnType<typeof initializer>>) {
    const inUpdating = updating;
    if (!inUpdating) {
      updating = true;
    }
    const result = initializer.apply(this).apply(this, args);
    if (!inUpdating) {
      setTimeout(async () => {
        if (result instanceof Promise) {
          await result;
        }
        timeTraveler.updateSnapshots();
        updating = false;
      }, 0);
    }
    return result;
  };
};

export const actionWithSnapshot = (...params: Parameters<typeof withSnapshot>) => {
  withSnapshot(...params);
  return (action as any)(...params);
};
