import { Amenity } from "./Amenity";

export type Room = {
    id: number;
    hotelid: number;
    note: string;
    typeid: number;
    name: string;
}

export type RoomType = {
    id: number;
    hotelid: number;
    name: string;
    size: number;
    capacity: number;
    base_price: number;
    description: string | null;
    amenities: Amenity[];
    beds: RoomBed[];
}

export type RoomBed = {
    name: string;
    count: number;
}