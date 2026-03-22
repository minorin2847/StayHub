export type Hotel = {
    id: number;
    name: string;
    classification: number;
    location: string;
    description: string;
    amenities: Array<{name: string, icon: string, category: string}>;
    policies: Array<{name: string, icon: string, description: string}>;
    previewimages: Array<string>;
    contact_email?: string;
    contact_phone?: string;
    _generatedPassword?: string;
}