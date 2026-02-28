export type EmployeeDTO = {
    id: number;
    username: string;
    email: string;
    hotelid: number;
    firstname: string;
    lastname: string;
    salary: number;
}

export type CreateEmployeeInput = {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    salary: number;
    targetRole: string;
    targetHotelID?: number | null;
}

