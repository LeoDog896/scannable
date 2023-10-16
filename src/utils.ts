/** Make one property in a type required */
export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] }