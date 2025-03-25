import { Context, Effect, Layer } from "effect";

export class ConfigService extends Context.Tag("Config")<
    ConfigService,
    {
        readonly getConfig: Effect.Effect<{
            readonly DATABASE_URL: string | undefined;
        }>
    }
>() { }

export const ConfigLive = Layer.succeed(
    ConfigService,
    ConfigService.of({
        getConfig: Effect.succeed({
            DATABASE_URL: process.env['DATABASE_URL']
        })
    })
)