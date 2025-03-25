import { Brand } from "effect";
import { Booking, Id, ISO8601DateTime } from "../schemas";

const id = Brand.nominal<Id>();
const dateTime = Brand.nominal<ISO8601DateTime>();

export const mockBookingWithNote: Booking = {
    id: id("1ff6aa8f-864c-4b6d-9e4b-51adefd53daf"),
    createdAt: dateTime("2023-10-12T10:30:00Z"),
    updatedAt: dateTime("2023-10-12T10:30:00Z"),
    orgId: id("8599a032-e7c3-45bb-a95c-cc28917f0e18"),
    status: "APPROVED",
    contact: {
        name: "Alice Johnson",
        email: "alice.johnson@example.com",
    },
    event: {
        title: "Team Meeting",
        locationId: id("c6ac917e-08dc-4933-b831-b9275c2fab15"),
        start: dateTime("2023-10-20T14:00:00Z"),
        end: dateTime("2023-10-20T15:00:00Z"),
        details: "Monthly team meeting. All team members are required to attend.",
    },
    requestNote: "Please prepare the conference room with refreshments.",
};