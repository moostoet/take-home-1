import { Context, Effect, Layer } from "effect";

export class ConfigService extends Context.Tag("Config")<
    ConfigService,
    {
        readonly getConfig: Effect.Effect<{
            readonly DATABASE_URL: string | undefined;
        }>
    }
>() { }

// Example of how variables like database URL's can be used across services.
export const ConfigLive = Layer.succeed(
    ConfigService,
    ConfigService.of({
        getConfig: Effect.succeed({
            DATABASE_URL: process.env['DATABASE_URL']
        })
    })
)