export default class Guest {
    id: number = 0;
    first_name: string = "";
    last_name: string = "";
    email: string | null = null;
    phone: string = "";
    id_card_number: string | null = null;
    address: string | null = null;
    created_at: Date = new Date();

        constructor(_: Partial<Guest>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];

            if (val !== undefined) {
                if (key === 'created_at') {
                    (this as any)[key] = new Date(val);
                } else {
                    (this as any)[key] = val;
                }
            }
        });
    }
}