export class ReservedRoom {
    roomID: number = 0;
    hotelID: number = 0;
    confirmation_code: string = "";
    booking_status: string = "Pending";
    payment_status: string = "Unpaid";
    
    checkin_date: Date = new Date();
    checkout_date: Date = new Date();
    
    num_adults: number = 1;
    num_children: number = 0;
    final_price: number = 0;
    special_requests: string | null = null;
    
    cancellation_deadline: Date = new Date();

    constructor(_: Partial<ReservedRoom>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                // Handle date conversion if the input comes as a string from the DB/API
                if (
                    (key === 'checkin_date' || key === 'checkout_date' || key === 'cancellation_deadline') && 
                    typeof val === 'string'
                ) {
                    (this as any)[key] = new Date(val);
                } else {
                    (this as any)[key] = val;
                }
            }
        });
    }
}

export default class Reserve {
    id: number = 0;
    userID: number = 0;
    guestID: number = 0;
    
    // Using overall_status to match the SQL View output
    overall_status: string = "Pending"; 
    
    total_rooms: number = 0;
    total_price: number = 0;

    rooms: ReservedRoom[] = [];

    created_at: Date = new Date();
    updated_at: Date = new Date();

    constructor(_: Partial<Reserve>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                // Handle date conversion if the input comes as a string from the DB/API
                if ((key === 'created_at' || key === 'updated_at') && typeof val === 'string') {
                    (this as any)[key] = new Date(val);
                } 
                // Handle nested array of ReservedRoom classes
                else if (key === 'rooms' && Array.isArray(val)) {
                    this.rooms = val.map(r => new ReservedRoom(r));
                }
                else {
                    (this as any)[key] = val;
                }
            }
        });
    }
}