import { Schema } from 'effect';
import * as F from '../lib/functions'
import { HttpApiSchema } from '@effect/platform';

export class BookingNotFoundError extends Error {
    readonly _tag = 'BookingNotFoundError'
}

export class ConflictingBookingError extends Schema.TaggedError<ConflictingBookingError>()(
    "ConflictingBookingError",
    {},
    HttpApiSchema.annotations({ status: 400 })
) { }

export const createBookingNotFoundError = F.create(BookingNotFoundError);
export const createConflictingBookingError = F.create(ConflictingBookingError)