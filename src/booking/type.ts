import { Brand, Schema } from "effect";
import { StoredBooking } from "./table";


export const bookingStatus = Schema.Literal("PENDING", "APPROVED", "DENIED", "CANCELLED")

export type bookingStatus = typeof bookingStatus.Type;

export const Id = Schema.String.pipe(Schema.brand("Id"));

export type Id = typeof Id.Type;

export const ISO8601DateTime = Schema.String.pipe(Schema.brand("ISO8601DateTime"));

export type ISO8601DateTime = typeof ISO8601DateTime.Type;

export const id = Brand.nominal<Id>();
export const dateTime = Brand.nominal<ISO8601DateTime>();

export const Booking = Schema.Struct({
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

export const storedBookingSchema = Schema.Struct({
    id: Schema.String,
    createdAt: Schema.String,
    updatedAt: Schema.String,
    orgId: Schema.String,
    status: bookingStatus,
    contactName: Schema.String,
    contactEmail: Schema.String,
    eventTitle: Schema.String,
    eventLocationId: Schema.String,
    eventStart: Schema.String,
    eventEnd: Schema.String,
    eventDetails: Schema.String,
    requestNote: Schema.NullOr(Schema.String),
})

export type Booking = Schema.Schema.Type<typeof Booking>;

export const BookingRequest = Booking.omit("id", "createdAt", "updatedAt", "status");

export type BookingRequest = Schema.Schema.Type<typeof BookingRequest>;

export type StoredBookingSchema = Schema.Schema.Type<typeof storedBookingSchema>;

const bookingFromStoredBooking = Schema.transform(
    storedBookingSchema,
    Booking,
    {
        strict: true,
        decode: (stored) => ({
            id: id(stored.id),
            createdAt: dateTime(stored.createdAt),
            updatedAt: dateTime(stored.updatedAt),
            orgId: id(stored.orgId),
            status: stored.status,
            contact: {
                name: stored.contactName,
                email: stored.contactEmail,
            },
            event: {
                title: stored.eventTitle,
                locationId: id(stored.eventLocationId),
                start: dateTime(stored.eventStart),
                end: dateTime(stored.eventEnd),
                details: stored.eventDetails,
            },
            requestNote: stored.requestNote ?? undefined,
        }),
        encode: (booking) => ({
            id: booking.id,
            createdAt: booking.createdAt,
            updatedAt: booking.updatedAt,
            orgId: booking.orgId,
            status: booking.status,
            contactName: booking.contact.name,
            contactEmail: booking.contact.email,
            eventTitle: booking.event.title,
            eventLocationId: booking.event.locationId,
            eventStart: booking.event.start,
            eventEnd: booking.event.end,
            eventDetails: booking.event.details,
            requestNote: booking.requestNote ?? null,
        }),
    }
)

export const decodeStored: (b: StoredBooking) => Booking = (b) => Schema.decodeUnknownSync(bookingFromStoredBooking)(b)

export const encodeStored: (b: Booking) => StoredBooking = (b) => Schema.encodeUnknownSync(bookingFromStoredBooking)(b)

