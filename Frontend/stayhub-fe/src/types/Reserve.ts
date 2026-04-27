export type ReservedRoom = {
    roomTypeID: number;
    roomID: number | null;
    hotelID: number;
    room_type_name: string;
    room_name?: string | null;
    confirmation_code: string;
    booking_status: string;
    payment_status: string;
    
    checkin_date: Date;
    checkout_date: Date;
    
    num_adults: number;
    num_children: number;
    final_price: number;
    special_requests: string | null;
    
    cancellation_deadline: Date;
}

export type Reserve = {
    id: number;
    userID: number;
    guestID: number;
    
    // Using overall_status to match the SQL View output
    overall_status: string; 
    
    total_rooms: number;
    total_price: number;

    rooms: ReservedRoom[];

    created_at: Date;
    updated_at: Date;
}

export type DashboardReserve = Reserve & {
    guest_full_name: string;
}
