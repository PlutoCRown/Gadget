export const string = ''
export const number = 0
export const boolean = false
export const object = {} as Record<string, any>
export const nullable = <T>(_: T) => _ as T | null
export const array = <T>(_: T[]) => [_] as T[]
export type Nullable<T> = T | null

type ConvertNull2Optional<T> = {
    [K in keyof T as null extends T[K] ? never : K]: T[K]
} & {
    [K in keyof T as null extends T[K] ? K : never]?: Exclude<T[K], null>
}

type MetaKey = '_name' | '_fetch'
type EventPayload<S> = ConvertNull2Optional<Omit<S, MetaKey>>

export type TrackerSender = (
    key: string,
    data: any,
    meta: { name: string; fetch: boolean }
) => void

export type TrackerModifier = (key: string, data: any) => any

export type TrackerConfig<Deprecated extends boolean = boolean> = {
    modifier?: TrackerModifier[]
    sender?: TrackerSender
    deprecated?: Deprecated
}

export type TrackerDefine = Record<
    string,
    { _name: string } & Record<string, any>
>

/**
 * 根据事件定义创建 tracker。事件展示名取自 schema 的 `_name`，
 * `_name` / `_fetch` 不会进入调用方 payload 类型。
 */
export const makeTracker = <
    T extends TrackerDefine,
    Deprecated extends boolean
>(
    define: T,
    config?: TrackerConfig<Deprecated>
) => {
    const tracker = {}
    const { modifier = [], deprecated, sender = () => { } } = config || {}
    const composedModifier = (key: string, data: any) => {
        let result = data
        for (const mod of modifier) {
            result = mod(key, result)
        }
        return result
    }

    for (const key of Object.keys(define)) {
        const schema = define[key]
        const name = schema._name
        const fetch = schema._fetch === true
        /** @ts-ignore */
        tracker[key] = (data: EventPayload<T[keyof T]>) =>
            !deprecated && sender(key, composedModifier(key, data), { name, fetch })
    }

    type DeprecatedCallable<K extends keyof T> =
        /** @deprecated 该组埋点已废弃 */
        (data: EventPayload<T[K]>) => void
    type Callable<K extends keyof T> = (data: EventPayload<T[K]>) => void
    return tracker as {
        [K in keyof T]: Deprecated extends true
        ? DeprecatedCallable<K>
        : Callable<K>
    }
}
