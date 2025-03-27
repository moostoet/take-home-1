import { Array, Console, Context, Effect, Layer, Match, Option, pipe, Schema } from "effect";
import { createDatabaseError, DatabaseError } from "../database/error";
import { Database } from "../database/service";
import { IdGenerator } from "../database/ids";

import * as Booking from './type';
import { bookingTable } from "./table";
import { eq } from "drizzle-orm";
import { always } from "../lib/functions";
import { createNotFoundError } from "./routes";
import { isConflicting } from "../database/query";
import { ConflictingBookingError, createConflictingBookingError } from "./error";
import { NotFound } from "@effect/platform/HttpApiError";
import { Email } from "../email/service";

/**
 * The bookings service responsible for CRUD operations on the bookings table in SQLite.
 */

export class Bookings extends Context.Tag('Service/Bookings')<
    Bookings,
    {
        list: Effect.Effect<Booking.Booking[], DatabaseError>,
        getById: (id: Booking.Id) => Effect.Effect<Option.Option<Booking.Booking>, DatabaseError>,
        submit: (booking: Booking.BookingRequest) => Effect.Effect<Booking.Booking, DatabaseError>,
        approve: (id: Booking.Id) => Effect.Effect<Booking.Booking, DatabaseError | ConflictingBookingError | NotFound>,
        deleteById: (id: Booking.Id) => Effect.Effect<string, DatabaseError>;
    }
>() {
    static Live = Layer.effect(
        Bookings,
        Effect.all([Database, IdGenerator, Email]).pipe(
            Effect.map(([db, idGen, email]) => {

                const list =
                    Effect.tryPromise({
                        try: () => db.select().from(bookingTable).all(),
                        catch: cause => createDatabaseError('Booking list query failed', { cause })
                    })


                const getById = (id: Booking.Id) => pipe(
                    Effect.tryPromise({
                        try: () => db.select().from(bookingTable).where(eq(bookingTable.id, id)).get(),
                        catch: cause => createDatabaseError('Booking get by id query failed', { cause })
                    }),
                    Effect.map(Option.fromNullable)
                )

                const filterConflictsBase = (result: Booking.Booking) => Effect.tryPromise({
                    try: () => db.select({
                        eventStart: bookingTable.eventStart,
                        eventEnd: bookingTable.eventEnd,
                        eventLocationId: bookingTable.eventLocationId,
                        status: bookingTable.status
                    })
                        .from(bookingTable)
                        .where(isConflicting(result)),
                    catch: cause => createDatabaseError('Could not find conflicts', { cause })
                })

                const filterConflictsError = (result: Booking.Booking) => pipe(
                    result,
                    filterConflictsBase,
                    Effect.flatMap(conflicts =>
                        Array.isEmptyArray(conflicts)
                            ? Effect.succeed(result)
                            : Effect.fail(createConflictingBookingError({ message: `There were conflicts with existing bookings. Please check your bookings and try again.` }))
                    )
                )

                const submit = (booking: Booking.Booking) => pipe(
                    filterConflictsBase(booking),
                    Effect.map(conflicts => ({
                        hasConflicts: !Array.isEmptyArray(conflicts),
                        updatedBooking: conflicts.length > 0
                            ? { ...booking, status: 'DENIED' as const }
                            : booking
                    })),
                    Effect.flatMap(({ updatedBooking }) =>
                        Effect.tryPromise({
                            try: async () => {
                                const storedBooking = Booking.encodeStored(updatedBooking);
                                const result = await db.insert(bookingTable).values(storedBooking).run();
                                return { result, updatedBooking };
                            },
                            catch: cause => createDatabaseError('Booking submission failed', { cause })
                        })
                    ),
                    Effect.map(({ updatedBooking }) => updatedBooking)
                )

                const approveBooking = (booking: Booking.Booking) => Effect.tryPromise({
                    try: () => db.update(bookingTable)
                        .set({ status: 'APPROVED', updatedAt: new Date().toISOString() })
                        .where(eq(bookingTable.id, booking.id))
                        .returning(),
                    catch: cause => createDatabaseError('Could not approve booking', { cause })
                }).pipe(
                    Effect.flatMap(results =>
                        results.length === 0
                            ? Effect.fail(createNotFoundError())
                            : Effect.succeed(results[0])
                    )
                )

                const approve = (id: Booking.Id) => pipe(
                    id,
                    getById,
                    Effect.flatMap(Option.match({
                        onNone: () => Effect.fail(createNotFoundError()),
                        onSome: (booking) => Effect.succeed(booking)
                    })),
                    Effect.map(Booking.decodeStored),
                    Effect.flatMap(filterConflictsError),
                    Effect.flatMap(approveBooking),
                    Effect.map(Booking.decodeStored),
                    Effect.tap(email.sendMail)
                )

                const deleteById = (id: Booking.Id) => pipe(
                    Effect.tryPromise({
                        try: () => db.delete(bookingTable).where(eq(bookingTable.id, id)).run(),
                        catch: cause => createDatabaseError('Booking delete failed', { cause })
                    }),
                    Effect.map(() => `Booking ${id} successfully deleted`)
                )

                return Bookings.of({
                    list: pipe(
                        list,
                        Effect.map(Array.map(Booking.decodeStored))
                    ),
                    getById: (id: Booking.Id) => pipe(
                        getById(id),
                        Effect.map(Option.map(Booking.decodeStored))
                    ),
                    submit: (booking: Booking.BookingRequest) => pipe(
                        Effect.succeed(booking),
                        Effect.bind('id', () => idGen.next),
                        Effect.let('createdAt', () => Booking.dateTime(new Date().toISOString())),
                        Effect.let('updatedAt', () => Booking.dateTime(new Date().toISOString())),
                        Effect.let('status', always('PENDING')),
                        Effect.flatMap(submit),
                        Effect.catchTag('IdError', () => Effect.die('Could not generate ULID'))
                    ),
                    approve: (id: Booking.Id) => pipe(
                        approve(id)
                    ),
                    deleteById: (id: Booking.Id) => pipe(
                        deleteById(id)
                    )
                })
            })
        )
    )
}