import { Array, Context, Effect, Layer, pipe } from "effect";
import { DatabaseError } from "../database/error";
import { Database } from "../database/service";
import { IdGenerator } from "../database/ids";

import * as Ops from './operations';
import * as Booking from './type';

export class Bookings extends Context.Tag('Service/Bookings')<
    Bookings,
    {
        list: Effect.Effect<Booking.Booking[], DatabaseError>
    }
>() {
    static Live = pipe(
        Effect.all([Database, IdGenerator]),
        Effect.map(([db, idGen]) => Bookings.of({
            list: pipe(
                Ops.list,
                Effect.provideService(Database, db),
                Effect.map(Array.map(Booking.decodeStored))
            )
        }))
    )
}
