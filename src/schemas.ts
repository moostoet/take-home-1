import { Schema } from "effect";

const bookingStatus = Schema.Literal("PENDING", "APPROVED", "DENIED", "CANCELLED")

export const Id = Schema.String.pipe(Schema.brand("Id"));

export type Id = typeof Id.Type;

export const ISO8601DateTime = Schema.String.pipe(Schema.brand("ISO8601DateTime"));

export type ISO8601DateTime = typeof ISO8601DateTime.Type;

export const bookingSchema = Schema.Struct({
    id: Id,
    createdAt: ISO8601DateTime,
    updatedAt: ISO8601DateTime,
    orgId: Id,
    status: bookingStatus,
    contact: Schema.Struct({
        name: Schema.String,
        email: Schema.String,
    }),
    event: Schema.Struct({
        title: Schema.String,
        locationId: Id,
        start: ISO8601DateTime,
        end: ISO8601DateTime,
        details: Schema.String
    }),
    requestNote: Schema.optional(Schema.String)
});

export type Booking = typeof bookingSchema.Type;