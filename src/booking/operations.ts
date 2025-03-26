/**
 * @module Booking
 * Database operations
 */

import { Effect, Option, pipe } from "effect";
import { Database } from "../database/service";
import { bookingTable } from "./table";
import { createDatabaseError } from "../database/error";
import { Booking, encodeStored, Id } from "./type";
import { eq } from "drizzle-orm";


export const list = pipe(
    Database,
    Effect.tryMapPromise({
        try: db => db.select().from(bookingTable).all(),
        catch: cause => createDatabaseError('Booking list query failed', { cause })
    }),
)

export const getById = (id: Id) => pipe(
    Database,
    Effect.tryMapPromise({
        try: db => db.select().from(bookingTable).where(eq(bookingTable.id, id)).get(),
        catch: cause => createDatabaseError('Booking get by id query failed', { cause })
    }),
    Effect.map(Option.fromNullable)
)

export const submit = (booking: Booking) => pipe(
    Database,
    Effect.flatMap(db =>
        Effect.tryPromise({
            try: async () => {
                const storedBooking = encodeStored(booking);
                const result = await
                    db.insert(bookingTable).values(storedBooking).run();
                return result;
            },
            catch: cause => createDatabaseError('Booking submission failed', { cause })
        })
    ),
    Effect.map(() => booking)
)