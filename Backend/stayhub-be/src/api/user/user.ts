
export default class User {
    id: number;
    accountid: number;
    firstname: string;
    lastname: string;
    phonenumber: string;
    gender: string;
    birthdate: Date;
    countrycode: string;
    address: string;
    avatar: string;


    constructor({
        id, 
        accountid, 
        firstname, 
        lastname, 
        phonenumber,
        gender,
        birthdate,
        countrycode,
        address,
        avatar} : {
            id: number;
            accountid: number;
            firstname: string;
            lastname: string;
            phonenumber: string;
            gender: string;
            birthdate: Date;
            countrycode: string;
            address: string;
            avatar: string;
        }) {
        this.id = id;
        this.accountid = accountid;
        this.firstname = firstname;
        this.lastname = lastname;
        this.phonenumber = phonenumber;
        this.gender = gender;
        this.birthdate = birthdate;
        this.countrycode = countrycode;
        this.address = address;
        this.avatar = avatar
    }
}