
export default class Role {
    name: string = "";
    tier: number = 0;

    
    constructor(_: Partial<Role>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}
