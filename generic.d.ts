export interface KeyValue<T> {
  [key: string]: T
}

export interface Function<T> {
  (a?: any, b?: any, c?: any, d?: any, e?: any, f?: any): T;
}

export as namespace Generic;