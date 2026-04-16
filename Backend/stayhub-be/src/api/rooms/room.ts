import type { RoomBed } from "../bed/bed.type.js";
import type { Amenities } from "../hotels/hotels.js";

export class RoomType {
    id: number = 0;
    hotelID: number = 0;
    name: string = "";
    size: number = 0;
    capacity: number = 0;
    base_price: number = 0;
    description: string | null = null;
    amenities: Amenities[] = [];
    beds: RoomBed[] = [];
    
    constructor(_: Partial<RoomType>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}

export class Room {
    id: number = 0;
    hotelid: number = 0;
    name: string = "";
    typeid: number = 0;
    note: string | null = null;

    constructor(_: Partial<Room>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}
