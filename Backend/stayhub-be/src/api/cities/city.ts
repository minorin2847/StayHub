export class City {
    abbreviation: string = "";
    name: string = "";
    images: string[] = [];
    description: string = "";

    constructor(_: Partial<City>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}

export class CityActivity {
    id: number = 0;
    name: string = "";
    city_abbreviation: string = "";
    images: string[] = [];
    description: string = "";
    type: string = "landmarks";

    constructor(_: Partial<CityActivity>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}
