import { HttpApi, HttpApiBuilder, HttpApiEndpoint, HttpApiError, HttpApiGroup, HttpApiSchema, HttpMiddleware } from "@effect/platform";
import { Effect, pipe, Schema, Console, Option } from "effect";
import { Booking, BookingRequest, Id } from "./type";
import { Bookings } from "./service";

import * as F from '../lib/functions'
import { ConflictingBookingError, createConflictingBookingError } from "./error";

const idStruct = Schema.Struct({
    id: Id
})

const createInternalServerError = F.create(HttpApiError.InternalServerError)
export const createNotFoundError = F.create(HttpApiError.NotFound)

/** 
 * Effect provides the HTTP Group API, which allows developers to
 * define set API group contracts that have to be fulfilled.
*/
export const BookingAPI = pipe(
    HttpApi.make("Booking API").add(
        HttpApiGroup.make("bookings")
            .add(
                HttpApiEndpoint.get("getBookings", "/bookings")
                    .addSuccess(Schema.Array(Booking))
                    .addError(HttpApiError.InternalServerError)
            )
            .add(
                HttpApiEndpoint.get("getBookingById", "/bookings/:id").setPath(
                    idStruct
                )
                    .addSuccess(Booking)
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
                )
                    .addSuccess(Booking)
                    .addError(HttpApiError.InternalServerError)
                    .addError(HttpApiError.NotFound)
                    .addError(ConflictingBookingError)
            )
            .add(
                HttpApiEndpoint.del("deleteBooking", "/bookings/:id").setPath(
                    idStruct
                )
                    .addSuccess(Schema.String)
                    .addError(HttpApiError.InternalServerError)
            )
    )
)


/**
 * A developer can then build a Live implementation of the API which
 * provides the actual functionality. This also means that the developer
 * can easily mock the API by making a similar Test implementation using
 * the same API group.
 */
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
            .handle("approveBooking", (req) => Bookings.pipe(
                Effect.flatMap(bookings => bookings.approve(req.path.id)),
                Effect.catchTags({
                    ConflictingBookingError: (err) => createConflictingBookingError(err),
                    NotFound: () => createNotFoundError(),
                    DatabaseError: () => createInternalServerError()
                })
            ))

            /* DELETE - Delete a single booking */
            .handle("deleteBooking", (req) => Bookings.pipe(
                Effect.flatMap(bookings => bookings.deleteById(req.path.id)),
                Effect.catchTag('DatabaseError', () =>
                    Effect.fail(createInternalServerError())
                )
            )
            )
    )
