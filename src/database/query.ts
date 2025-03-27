import { and, eq, or, sql } from "drizzle-orm";
import { bookingTable } from "../booking/table";
import { Booking } from "../booking/type";

/**
 * Query for determining whether a booking conflicts with an existing one.
 */

export const isConflicting = (booking: Booking) =>
    and(
        eq(bookingTable.status, "APPROVED"),
        eq(bookingTable.eventLocationId, booking.event.locationId),
        or(
            and(
                sql`${bookingTable.eventStart} >= ${booking.event.start}`,
                sql`${bookingTable.eventEnd} < ${booking.event.end}`
            ),
            and(
                sql`${bookingTable.eventEnd} > ${booking.event.start}`,
                sql`${bookingTable.eventEnd} <= ${booking.event.end}`
            ),
            and(
                sql`${bookingTable.eventStart} <= ${booking.event.start}`,
                sql`${bookingTable.eventEnd} >= ${booking.event.end}`
            )
        )
    );