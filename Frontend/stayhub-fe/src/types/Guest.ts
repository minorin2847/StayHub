export type Guest = {
    id: number;
    first_name: string;
    last_name: string;
    full_name: string;
    email: string | null;
    phone: string;
    id_card_number: string | null;
    address: string | null;
    created_at: Date;
    total_bookings: string;
    last_stay_date: Date;
}