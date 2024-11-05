/**
 * A type that makes all properties optional, except for the specified ones, which are left required.
 * e.g. AtLeast<ISceneObject, "material" | "parameters">;
 */
export declare type AtLeast<T, K extends keyof T> = Partial<T> & Pick<T, K>;
