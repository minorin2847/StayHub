export default class User {
    id: number = 0;
    username: string = "";
    email: string = "";
    firstname: string = "";
    lastname: string = "";
    phonenumber: string = "";
    gender: string = "";
    birthdate: Date = new Date;
    countrycode: string = "";
    address: string = "";
    avatar: string = "";

    constructor(_: Partial<User>) {
        // This only copies properties that exist on the instance (the whitelist)
        Object.keys(this).forEach((key) => {
            const val = (_ as any)[key];
            if (val !== undefined) {
                (this as any)[key] = val;
            }
        });
    }
}
