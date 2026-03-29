export type Room = {
    id: number;
    classification: number;
    name: String;
    hotelid: number;
    description: string;
    price: number;
    size: number;
    capacity: number;
    type: string;
    discount: number;
    previewimages: Array<string>;
    beds: Array<{name: string; count: number}>;
    amenities: Array<{name: string; icon: string; category: string}>
}