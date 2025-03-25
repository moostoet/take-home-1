import { Config, Context, Effect, Layer, Option, pipe, Redacted } from 'effect';
import { type LibSQLDatabase, drizzle } from 'drizzle-orm/libsql'
import { createClient } from '@libsql/client';
import { createDatabaseError } from './error';

export class Database extends Context.Tag('Database')<
    Database,
    LibSQLDatabase
>() { }

export const DatabaseLive = Layer.effect(
    Database,
    pipe(
        Config.all([
            Config.string('DATABASE_URL'),
            Config.option(Config.redacted('DB_TOKEN'))
        ]),
        Effect.flatMap(([url, token]) => Effect.try({
            try: () => {
                const authToken = Option.map(token, Redacted.value)
                const client = createClient({ url, authToken: Option.getOrUndefined(authToken) })
                return Database.of(drizzle(client))
            },
            catch: cause => createDatabaseError('Database setup failed', { cause })
        }))
    )
)