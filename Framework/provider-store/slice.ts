export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

export type SlicePartial<T> = {
  [K in keyof T]?: T[K] extends object ? Partial<T[K]> : T[K];
};

// 直接 set({ value: newValue }) 的类型
type ImmiateValue<T> = Partial<T>;
// 用Draft的修改方式 set(draft => draft.value = newValue)
type Draft2Modify<T> = (draft: T) => void;
export type ImmerSuportModifyMethod<T> = ImmiateValue<T> | Draft2Modify<T>;
export type ImmerSetter<Store> = (
  modified: ImmerSuportModifyMethod<Store>
) => void;

// 以下为切片store类型支持
// 切片的类型运行对一级子类型进行Partial
type ImmiateSliceValue<T> = SlicePartial<T>;
export type ImmerSliceSuportModifyMethod<T> =
  | ImmiateSliceValue<T>
  | Draft2Modify<T>;

export type ImmerSliceSetter<Store> = (
  modified: ImmerSuportModifyMethod<Store>
) => void;

export type ActionSlice<Store, Action> = (
  set: ImmerSliceSetter<Store>,
  get: () => Store
) => Action;

export const sliceSet = <T, K extends keyof T>(
  originSet: ImmerSetter<T>,
  key: K
) => {
  return (modified: ImmerSuportModifyMethod<T[K]>) => {
    originSet((draft) => {
      if (modified instanceof Function) {
        modified(draft[key]);
      } else {
        Object.keys(modified).forEach((prop) => {
          draft[key][prop as keyof T[K]] = modified[
            prop as keyof T[K]
          ] as T[K][keyof T[K]];
        });
      }
    });
  };
};

export const sliceGet = <T, K extends keyof T>(originGet: () => T, key: K) => {
  return () => originGet()[key];
};
