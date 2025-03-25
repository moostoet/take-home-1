import {
  HttpApi,
  HttpApiBuilder,
  HttpApiEndpoint,
  HttpApiGroup,
  HttpApiScalar
} from "@effect/platform"
import { NodeHttpServer, NodeRuntime } from "@effect/platform-node"
import { Effect, Layer, Schema } from "effect"
import { LibsqlClient } from "@effect/sql-libsql"
import { createServer } from "node:http"

const SqlLive = LibsqlClient.layer({
  url: 'file:booking_db'
})

const BookingAPI = HttpApi.make("BookingAPI").add(
  HttpApiGroup.make("Bookings").add(
    HttpApiEndpoint.get("bookings")`/`.addSuccess(Schema.String)
  )
)

const BookingsLive = HttpApiBuilder.group(BookingAPI, "Bookings", (handlers) =>
  handlers.handle("bookings", () => Effect.succeed("Booking example"))
)

const BookingAPILive = HttpApiBuilder.api(BookingAPI).pipe(Layer.provide(BookingsLive))

const ServerLive = HttpApiBuilder.serve().pipe(
  // Provide the Swagger layer so clients can access auto-generated docs
  Layer.provide(HttpApiScalar.layer()),
  Layer.provide(SqlLive),
  Layer.provide(BookingAPILive),
  Layer.provide(NodeHttpServer.layer(createServer, { port: 3000 }))
)

Layer.launch(ServerLive).pipe(NodeRuntime.runMain)