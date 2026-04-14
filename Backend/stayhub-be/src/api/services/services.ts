export default class Service {
    id: number = 0;
    hotelid: number = 0;
    type: string = "";
    name: string = "";
    description: string | null = null;
    coverimage: string | null = null;
    price: number = 0;

    constructor(_: Partial<Service>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}