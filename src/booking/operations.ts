/**
 * @module Booking
 * Database operations
 */

import { Effect, pipe } from "effect";
import { Database } from "../database/service";
import { bookingTable } from "./table";
import { createDatabaseError } from "../database/error";


export const list = pipe(
    Database,
    Effect.tryMapPromise({
        try: db => db.select().from(bookingTable).all(),
        catch: cause => createDatabaseError('Booking list query failed', { cause })
    }),
)