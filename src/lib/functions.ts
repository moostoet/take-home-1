/**
 * Creates factory functions from classes.
 * Accepts any arity for constructor.
 *
 * @param ClassType
 */
export const create = <T extends any[], U>(ClassType: new (...args: T) => U) =>
    (...args: T): U => new ClassType(...args)