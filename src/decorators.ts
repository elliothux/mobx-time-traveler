import "reflect-metadata";
import { action } from "mobx";
import { timeTraveler } from "./timeTraveling";
import { recordStoreHistory, recordedStores, ignoreStoreField } from "./record";

export const withTimeTravel = <T extends { new (...args: unknown[]): any }>(
  target: T
): T => {
  // return target;
  const original = target;
  const f = function (...args: ConstructorParameters<typeof target>) {
    const { name } = original;
    if (recordedStores[name]) {
      throw new Error(
        `Store "${name}" has already been recorded. Make sure that every store has an unique class name and instantiated only once`
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

export const withSnapshot = (payload?: Record<string, any>) => {
  return (
    target: object,
    propertyKey: string,
    descriptor?: PropertyDescriptor
  ): void => {
    let v: any;
    Object.defineProperty(target, propertyKey, {
      get: () => {
        debugger;
        return v;
      },
      set: (i) => {
        debugger;
        v = i;
      },
      enumerable: true,
      configurable: true,
    });
    return;

    const { value: initializer } = descriptor as any;
    descriptor!.value = function (
      ...args: Parameters<ReturnType<typeof initializer>>
    ) {
      const inUpdating = updating;
      if (!inUpdating) {
        updating = true;
      }
      const result = initializer.call(target).apply(target, args);
      if (!inUpdating) {
        window.setTimeout(async () => {
          if (result instanceof Promise) {
            await result;
          }
          timeTraveler.updateSnapshots(
            target.constructor.name,
            propertyKey,
            payload
          );
          updating = false;
        }, 0);
      }
      return result;
    };
    return descriptor as any;
  };
};

export const actionWithSnapshot = <T extends object = Record<string, any>>(
  payloadOrTarget: any,
  propertyKey: string,
  descriptor?: PropertyDescriptor
) => {
  if (!propertyKey) {
    const payload = payloadOrTarget as Record<string, any>;
    return (
      target: object,
      propertyKey: string,
      descriptor?: PropertyDescriptor
    ) => {
      withSnapshot.call(target, payload)(target, propertyKey, descriptor);
      return action.call(target, target, propertyKey, descriptor);
    };
  }

  const target = payloadOrTarget as object;
  withSnapshot.call(target)(target, propertyKey, descriptor);
  return action.call(target, target, propertyKey, descriptor) as any;
};

export const ignoreSnapshot = (target: object, propertyKey: string): void => {
  ignoreStoreField(target.constructor.name, propertyKey);
};
