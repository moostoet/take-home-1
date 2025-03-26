import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema, HttpMiddleware } from "@effect/platform";
import { Effect, pipe, Schema, Console, Option } from "effect";
import { Booking, BookingRequest, Id } from "./type";
import { mockBookingWithNote } from "../test/mock";
import { Bookings } from "./service";

import * as F from '../lib/functions'

const idStruct = Schema.Struct({
    id: Id
})

const createInternalServerError = F.create(HttpApiError.InternalServerError)
const createNotFoundError = F.create(HttpApiError.NotFound)

export const BookingAPI = pipe(
    HttpApi.make("Booking API").add(
        HttpApiGroup.make("bookings")
            .add(
                HttpApiEndpoint.get("getBookings", "/bookings").addSuccess(Schema.Array(Booking))
                    .addError(HttpApiError.InternalServerError)
            )
            .add(
                HttpApiEndpoint.get("getBookingById", "/bookings/:id").setPath(
                    idStruct
                ).addSuccess(Booking)
                    .addError(HttpApiError.InternalServerError)
                    .addError(HttpApiError.NotFound)
            )
            .add(
                HttpApiEndpoint.post("submitBooking", "/bookings")
                    .setPayload(BookingRequest)
                    .addSuccess(Booking)
                    .addError(HttpApiError.InternalServerError)
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

export const BookingLive =
    HttpApiBuilder.group(BookingAPI, "bookings", (handlers) =>
        handlers
            /* GET - Get all bookings */
            .handle("getBookings", (req) => Bookings.pipe(
                Effect.flatMap(bookings => bookings.list),
                Effect.tapError(Console.debug),
                Effect.catchTag('DatabaseError', () =>
                    Effect.fail(createInternalServerError())
                )
            ))

            /* GET - Get single booking */
            .handle("getBookingById", (req) => Bookings.pipe(
                Effect.flatMap(bookings => bookings.getById(req.path.id)),
                Effect.flatMap(option =>
                    Option.match(option, {
                        onNone: () => Effect.fail(createNotFoundError()),
                        onSome: (booking) => Effect.succeed(booking)
                    })
                ),
                Effect.catchTag('DatabaseError', () =>
                    Effect.fail(createInternalServerError())
                )
            ))

            /* POST - Submit a single booking */
            .handle("submitBooking", (req) => Bookings.pipe(
                Effect.flatMap(bookings => bookings.submit(req.payload)),
                Effect.catchTag('DatabaseError', () =>
                    Effect.fail(createInternalServerError())
                )
            ))

            /* POST - Approve a single booking */
            .handle("approveBooking", (req) =>
                Effect.succeed(mockBookingWithNote))

            /* DELETE - Delete a single booking */
            .handle("deleteBooking", (req) => Effect.succeed('OK'))
    )