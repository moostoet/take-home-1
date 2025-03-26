import * as F from '../lib/functions'

export class HttpApiError extends Error {
    readonly _tag = 'HttpApiError'
}

export const createHttpApiError = F.create(HttpApiError);