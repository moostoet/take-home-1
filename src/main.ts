import {
  HttpApiBuilder,
  HttpApiScalar
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Layer } from "effect"
import { createServer } from "node:http"
import { DatabaseLive } from "./database/service.js"
import { BookingAPI, BookingsLive } from "./routes.js"

const BookingAPILive = HttpApiBuilder.api(BookingAPI).pipe(Layer.provide(BookingsLive))

// Live server implementation - with Effect, you can create "Live" and "Test" versions of code easily to test and iterate.
const ServerLive = HttpApiBuilder.serve().pipe(
  Layer.provide(HttpApiScalar.layer()),
  Layer.provide(DatabaseLive),
  Layer.provide(BookingAPILive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)

Layer.launch(ServerLive).pipe(NodeRuntime.runMain)