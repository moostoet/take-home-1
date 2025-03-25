import { Array, Context, Effect, pipe } from 'effect'
import { monotonicFactory } from 'ulid'
import * as F from '../lib/functions'
import { Database } from './service'

export class IdError extends Error {
    readonly _tag = 'IdError'
}
const createIdError = F.create(IdError)

export class IdGenerator extends Context.Tag('IdGenerator')<
    IdGenerator,
    {
        next: Effect.Effect<string, IdError>
    }
>() {
    static Live = () => {
        const next = monotonicFactory()

        return IdGenerator.of({
            next: Effect.try({
                try: next,
                catch: cause => createIdError('Id generation failed', { cause }),
            }),
        })
    }

    static getWithDb = pipe(
        IdGenerator,
        Effect.flatMap(gen => Effect.all([Database, gen.next])),
    )

    static getTupleWithDb = <T>(list: readonly T[]) => pipe(
        IdGenerator,
        Effect.flatMap(gen => Effect.all([Database, ...Array.map(list, item => pipe(
            gen.next,
            Effect.map((id): [id: string, item: T] => [id, item] as const),
        ))])),
    )
}
