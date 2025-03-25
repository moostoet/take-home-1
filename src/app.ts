import { HttpApiBuilder, HttpApiScalar } from "@effect/platform";
import { Config, Effect, Layer, pipe } from "effect";
import { ConfigLive } from "./config";
import { DatabaseLive } from "./database/service";
import { BookingsLive } from "./routes";
import { NodeHttpServer } from "@effect/platform-node";
import { createServer } from "http";

export const App = HttpApiBuilder.serve().pipe(
    Layer.provide(HttpApiScalar.layer()),
    Layer.provide(ConfigLive),
    Layer.provide(DatabaseLive),
    Layer.provide(BookingsLive),
    Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)