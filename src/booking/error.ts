import { Schema } from 'effect';
import * as F from '../lib/functions'

export class BookingNotFoundError extends Error {
    readonly _tag = 'BookingNotFoundError'
}

export const createBookingNotFoundError = F.create(BookingNotFoundError);