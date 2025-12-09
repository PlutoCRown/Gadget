import { Immer } from "immer";
import {
  createContext,
  EffectCallback,
  ReactNode,
  useContext,
  useEffect,
  useRef,
} from "react";
import { StoreApi, useStore } from "zustand";

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

type ConfigType<T> = {
  /** 传入一个名字，如果在Provider范围之外使用，会用来报错 */
  name?: string;
  /** 传入一个函数，可以使Store具有 mounted 和 unmounted 的hook */
  effect?: (store: StoreApi<T>) => (() => void) | void;
};

export function createProviderStore<StoreType>(
  StoreBuilder: (initState: DeepPartial<StoreType>) => StoreApi<StoreType>,
  config?: ConfigType<StoreType>
) {
  type StoreInstance = ReturnType<typeof StoreBuilder>;

  const StoreContext = createContext<StoreInstance | undefined>(undefined);

  interface ProviderProps {
    children: ReactNode;
    /** 传入初始化该store的内容，结构与store一致 */
    init?: DeepPartial<StoreType>;
    /** 传入StoreApi创建上下文的引用，需要通过不传selector的useStore获取 */
    store?: StoreInstance;
    /** 根据key自动重用Store，不能和 store 同时生效*/
    id?: string;
    /** 上下文存储用一个store时, 下文里传patch, 可以直接改掉原本store的初始值
     * (例: 我外层CommentProvider里init传commentsTotal值, 此时commentsTotal值为初始值, 还没更新; 我值更新后, 它store也不会同步更新, 此时我把更新后的这个值传给下层CommentProvider的patch里, 这个值就改了)
     */
    patch?: Partial<StoreType>;
    effect?: EffectCallback;
  }

  const StoreProvider = ({
    children,
    init = {},
    store,
    id,
    patch,
  }: ProviderProps) => {
    const storeRef = useRef<StoreInstance | null>(null);

    if (!storeRef.current) {
      // 有 id 则优先从全局获取
      if (id && reuseableStore.has(id)) {
        storeRef.current = reuseableStore.get(id) as StoreInstance;
        patch && storeRef.current.setState(patch);
      } else if (store) {
        // 没有 id 但有 store 则用传入的
        storeRef.current = store;
        patch && storeRef.current.setState(patch);
      } else {
        // 否则创建新的 store
        storeRef.current = StoreBuilder(init);
        id && reuseableStore.set(id, storeRef.current);
      }
    }
    // 定义通用effect
    useEffect(() => {
      const store = storeRef.current!;
      if (!config?.effect) return;

      const prevCount = refCounts.get(store) || 0;
      refCounts.set(store, prevCount + 1);

      if (!effectRecord.has(store)) {
        const cleanup = config.effect(store);
        if (typeof cleanup === "function") {
          effectRecord.set(store, cleanup);
        }
      }

      return () => {
        const currentCount = refCounts.get(store)! - 1;
        if (currentCount <= 0) {
          refCounts.delete(store);
          const cleanup = effectRecord.get(store);
          if (cleanup) {
            cleanup();
            effectRecord.delete(store);
          }
          // 如果是 id 创建的 store，也可以选择清理掉
          if (id) {
            reuseableStore.delete(id);
          }
        } else {
          refCounts.set(store, currentCount);
        }
      };
    }, []);
    return (
      <StoreContext.Provider value={storeRef.current!}>
        {children}
      </StoreContext.Provider>
    );
  };
  // 定义两种返回类型
  function useFactoryStore(): StoreApi<StoreType>;
  function useFactoryStore<T>(selector: (store: StoreType) => T): T;
  function useFactoryStore<T>(
    selector?: (store: StoreType) => T
  ): T | StoreApi<StoreType> {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error(
        `${config?.name || ""} 👈 全局存储必须在Provider中使用！`
      );
    }
    return selector ? useStore(store, selector) : store;
  }

  return {
    StoreProvider,
    useFactoryStore,
  };
}

// 直接 set({ value: newValue }) 的类型
type ImmiateValue<T> = Partial<T>;
// 用Draft的修改方式 set(draft => draft.value = newValue)
type Draft2Modify<T> = (draft: T) => void;

export type ImmerSuportModifyMethod<T> = ImmiateValue<T> | Draft2Modify<T>;
export type ImmerSetter<Store> = (
  modified: ImmerSuportModifyMethod<Store>
) => void;

type AnyStoreInstance = object;
const reuseableStore = new Map<string, AnyStoreInstance>();
const effectRecord = new WeakMap<AnyStoreInstance, () => void>();
const refCounts = new WeakMap<AnyStoreInstance, number>();
