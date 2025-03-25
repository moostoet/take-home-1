import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiGroup, HttpApiSchema } from "@effect/platform";
import { Effect, pipe, Schema } from "effect";
import { bookingSchema, Id } from "./schemas";
import { mockBookingWithNote } from "./test/mock";

const idStruct = Schema.Struct({
    id: Id
})

export const BookingAPI = pipe(
    HttpApi.make("Booking API").add(
        HttpApiGroup.make("bookings")
            .add(
                HttpApiEndpoint.get("getBookings", "/bookings").addSuccess(Schema.Array(bookingSchema))
            )
            .add(
                HttpApiEndpoint.get("getBookingById", "/bookings/:id").setPath(
                    idStruct
                ).addSuccess(bookingSchema)
            )
            .add(
                HttpApiEndpoint.post("submitBooking", "/bookings")
                    .setPayload(bookingSchema)
                    .addSuccess(bookingSchema)
            )
            .add(
                HttpApiEndpoint.post("approveBooking", "/bookings/:id/approve").setPath(
                    idStruct
                ).addSuccess(bookingSchema)
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
        handlers.handle("getBookings", (req) =>
            Effect.succeed([mockBookingWithNote]))
            .handle("getBookingById", (req) =>
                Effect.succeed(mockBookingWithNote))
            .handle("submitBooking", (req) =>
                Effect.succeed(mockBookingWithNote))
            .handle("approveBooking", (req) =>
                Effect.succeed(mockBookingWithNote))
            .handle("deleteBooking", (req) => Effect.succeed('OK'))
    )