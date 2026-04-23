import type Booking from "./booking.js";

export type DashboardBooking = Booking & {
    guest_full_name: string;
    has_reserve: boolean;
}