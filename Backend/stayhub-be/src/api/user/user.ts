
export default class User {
    id: number;
    username: string;
    email: string;
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
        username,
        email, 
        firstname, 
        lastname, 
        phonenumber,
        gender,
        birthdate,
        countrycode,
        address,
        avatar} : {
            id: number;
            username: string;
            email: string;
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
        this.username = username;
        this.email = email;
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