import type { UserDTO } from "./user.type.js";

export default class User {
    id: string;
    username: string;
    salt: string;
    hash: string;
    roles: string[];

    name: string;
    email: string;
    avatar: string;

    constructor({id, username, salt, hash, roles, name, email, avatar} : {
        id: string,
        username: string,
        salt: string,
        hash: string,
        roles: string[],
        name: string,
        email: string,
        avatar: string
    }) {
        this.id = id;
        this.username = username;
        this.salt = salt;
        this.hash = hash;
        this.roles = roles;

        this.name = name;
        this.email = email;
        this.avatar = avatar
    }

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