import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { Id, ISO8601DateTime } from "./type";
import { InferSelectModel } from "drizzle-orm";

/**
 * SQLite table for the bookings.
 */
export const bookingTable = sqliteTable('bookings', {
    id: text('id').primaryKey(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
    orgId: text('org_id').notNull(),
    status: text({ enum: ["PENDING", "APPROVED", "DENIED", "CANCELLED"] }).notNull(),
    contactName: text('contact_name').notNull(),
    contactEmail: text('contact_email').notNull(),
    eventTitle: text('event_title').notNull(),
    eventLocationId: text('event_location_id').notNull(),
    eventStart: text('event_start').notNull(),
    eventEnd: text('event_end').notNull(),
    eventDetails: text('event_details').notNull(),
    requestNote: text('request_note')
})

export type StoredBooking = InferSelectModel<typeof bookingTable>
