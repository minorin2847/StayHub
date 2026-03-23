export interface Amenities {
    name: string;
    icon: string;
    category: string;
}

export interface Policies {
    name: string;
    description: string;
}



export default interface Hotel {
    id: number;
    name: string;
    classification: number;
    branchid: number;
    location: string;
    description: string;
    amenities: Amenities[];
    policies: Policies[];
    previewimages: string[];
    contact_email: string;
    contact_phone: string;
}
