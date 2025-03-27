import * as F from '../lib/functions'

/**
 * Effect's errors use _tag to determine the error cause.
 */

export class DatabaseError extends Error {
    readonly _tag = 'DatabaseError'
}

export const createDatabaseError = F.create(DatabaseError)
