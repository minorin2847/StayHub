import type Reserve from "./reserve.js";

export type DashboardReserve = Reserve & {
    guest_full_name: string;
}