import * as F from '../lib/functions'

export class DatabaseError extends Error {
    readonly _tag = 'DatabaseError'
}

export const createDatabaseError = F.create(DatabaseError)
