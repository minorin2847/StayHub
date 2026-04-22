import type Guest from "./guests.js";

export type DashboardGuest = Guest & {
    full_name: string;
    total_bookings: number;
    last_stay_date: Date;
}