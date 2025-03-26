import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, HttpApiSchema, HttpMiddleware } from "@effect/platform";
import { Effect, Layer, pipe, Schema } from "effect";
import { Booking, Id } from "./booking/type";
import { mockBookingWithNote } from "./test/mock";
import { Bookings } from "./booking/service";

const idStruct = Schema.Struct({
    id: Id
})

export const BookingAPI = pipe(
    HttpApi.make("Booking API").add(
        HttpApiGroup.make("bookings")
            .add(
                HttpApiEndpoint.get("getBookings", "/bookings").addSuccess(Schema.Array(Booking))
            )
            .add(
                HttpApiEndpoint.get("getBookingById", "/bookings/:id").setPath(
                    idStruct
                ).addSuccess(Booking)
            )
            .add(
                HttpApiEndpoint.post("submitBooking", "/bookings")
                    .setPayload(Booking)
                    .addSuccess(Booking)
            )
            .add(
                HttpApiEndpoint.post("approveBooking", "/bookings/:id/approve").setPath(
                    idStruct
                ).addSuccess(Booking)
            )
            .add(
                HttpApiEndpoint.del("deleteBooking", "/bookings/:id").setPath(
                    idStruct
                )
            )
    )
)

export const BookingsLive =
    HttpApiBuilder.group(BookingAPI, "bookings", (handlers) =>
        handlers
            /* Consider adding some annotation here for easier reading */
            .handle("getBookings", (req) => Bookings.pipe(
                Effect.succeed([mockBookingWithNote])
            )

                /* Get single booking */
                .handle("getBookingById", (req) =>
                    Effect.succeed(mockBookingWithNote))

                /* Submit to my w- */
                .handle("submitBooking", (req) =>
                    Effect.succeed(mockBookingWithNote))

                .handle("approveBooking", (req) =>
                    Effect.succeed(mockBookingWithNote))

                .handle("deleteBooking", (req) => Effect.succeed('OK'))
            )