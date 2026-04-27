export class BookedRoom {
    roomID: number = 0;
    room_status: string = "Reserved";
    checkin_date: Date = new Date();
    checkout_date: Date = new Date();
    room_price: number = 0;

    constructor(_: Partial<Booking>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                // Handle date conversion if the input comes as a string from the DB/API
                if ((key === 'checkin_date' || key === 'checkout_date') && typeof val === 'string') {
                    (this as any)[key] = new Date(val);
                } else {
                    (this as any)[key] = val;
                }
            }
        });
    }
}

export default class Booking {
    id: number = 0;
    guestID: number = 0;
    reserveID: number | null = null;
    
    checkin_date: Date = new Date();
    checkout_date: Date = new Date();
    
    booking_status: string = "Confirmed Booking";
    actual_total_price: number | null = null;
    total_rooms: number = 0;

    rooms: BookedRoom[] = [];

    created_at: Date = new Date();

    constructor(_: Partial<Booking>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                // Handle date conversion if the input comes as a string from the DB/API
                if ((key === 'checkin_date' || key === 'checkout_date' || key === 'created_at') && typeof val === 'string') {
                    (this as any)[key] = new Date(val);
                } 
                else if (key === 'rooms' && Array.isArray(val)) {
                    this.rooms = val.map(r => new BookedRoom(r));
                }
                else {
                    (this as any)[key] = val;
                }
            }
        });
    }
}