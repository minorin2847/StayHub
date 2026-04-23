export type Booking = {
    id: number;
    guestID: number;
    roomID: number;
    reserveID: number | null;
    
    checkin_date: Date;
    // Defaulting to 5 days from now to match your SQL: (CURRENT_DATE + 5)
    checkout_date: Date;
    
    booking_status: string;
    actual_total_price: number | null;
    created_at: Date;
    guest_full_name: string;
    has_reserve: boolean;
}