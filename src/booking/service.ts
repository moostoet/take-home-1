import { Array, Context, Effect, Layer, Option, pipe, Record, Schema } from "effect";
import { identity } from "effect/Function"
import { createDatabaseError, DatabaseError } from "../database/error";
import { Database } from "../database/service";
import { createIdError, IdGenerator } from "../database/ids";

import * as Booking from './type';
import { bookingTable } from "./table";
import { eq } from "drizzle-orm";

export class Bookings extends Context.Tag('Service/Bookings')<
    Bookings,
    {
        list: Effect.Effect<Booking.Booking[], DatabaseError>,
        getById: (id: Booking.Id) => Effect.Effect<Option.Option<Booking.Booking>, DatabaseError>,
        submit: (booking: Booking.BookingRequest) => Effect.Effect<Booking.Booking, DatabaseError>;
    }
>() {
    static Live = Layer.effect(
        Bookings,
        Effect.all([Database, IdGenerator]).pipe(
            Effect.map(([db, idGen]) => {

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

                const submit = (booking: Booking.Booking) => pipe(
                    Effect.tryPromise({
                        try: async () => {
                            const storedBooking = Booking.encodeStored(booking);
                            const result = await
                                db.insert(bookingTable).values(storedBooking).run();
                            return result;
                        },
                        catch: cause => createDatabaseError('Booking submission failed', { cause })
                    }),
                    Effect.map(() => booking),
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
                        Effect.let('status', () => Schema.decodeUnknownSync(Booking.bookingStatus)('PENDING')),
                        Effect.flatMap(submit),
                        Effect.catchTag('IdError', () => Effect.die('Could not generate ULID'))
                    )
                })
            })
        )
    )
}

const date = new Date().toISOString()