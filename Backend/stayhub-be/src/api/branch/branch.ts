export default class Branch {
    id: number = 0;
    name: string = "";
    location: string = "";
    description: string = "";

    constructor(_: Partial<Branch>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}
