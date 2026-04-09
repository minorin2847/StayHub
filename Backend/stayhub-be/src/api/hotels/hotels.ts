export interface Amenities {
    name: string;
    icon: string;
    category: string;
}

export interface Policies {
    name: string;
    description: string;
}



export default class Hotel {
    id: number = 0;
    name: string = "";
    classification: number = 0;
    branchid: number = 0;
    location: string = "";
    description: string = "";
    amenities: Amenities[] = [];
    policies: Policies[] = [];
    previewimages: string[] = [];
    contact_email: string = "";
    contact_phone: string = "";

    constructor(_: Partial<Hotel>) {
// This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}
