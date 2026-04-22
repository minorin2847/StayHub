export default class Booking {
    id: number = 0;
    guestID: number = 0;
    roomID: number = 0;
    reserveID: number | null = null;
    
    checkin_date: Date = new Date();
    // Defaulting to 5 days from now to match your SQL: (CURRENT_DATE + 5)
    checkout_date: Date = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
    
    booking_status: string = "Checked-In";
    actual_total_price: number | null = null;
    created_at: Date = new Date();

    constructor(_: Partial<Booking>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                // Handle date conversion if the input comes as a string from the DB/API
                if ((key === 'checkin_date' || key === 'checkout_date' || key === 'created_at') && typeof val === 'string') {
                    (this as any)[key] = new Date(val);
                } else {
                    (this as any)[key] = val;
                }
            }
        });
    }
}