import { Brand } from "effect";


import * as Booking from "../booking/type";

export const mockBookingWithNote: Booking.Booking = {
    id: Booking.id("1ff6aa8f-864c-4b6d-9e4b-51adefd53daf"),
    createdAt: Booking.dateTime("2023-10-12T10:30:00Z"),
    updatedAt: Booking.dateTime("2023-10-12T10:30:00Z"),
    orgId: Booking.id("8599a032-e7c3-45bb-a95c-cc28917f0e18"),
    status: "APPROVED",
    contact: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
    },
    event: {
        title: "Team Meeting",
        locationId: Booking.id("c6ac917e-08dc-4933-b831-b9275c2fab15"),
        start: Booking.dateTime("2023-10-20T14:00:00Z"),
        end: Booking.dateTime("2023-10-20T15:00:00Z"),
        details: "Monthly team meeting. All team members are required to attend.",
    },
    requestNote: "Please prepare the conference room with refreshments.",
};