export type Hotel = {
    id: number;
    name: string;
    branchid: number;
    classification: number;
    location: string;
    description: string;
    rooms: number;
    floors: number;
    amenities: Array<{name: string, icon: string, category: string}>;
    policies: Array<{name: string, icon: string, description: string}>;
    reviewimages: Array<string>
}