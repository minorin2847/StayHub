
export type CreateEmployeeInput = {
    username: string;
    password: string;
    email: string;
    firstName: string;
    lastName: string;
    salary: number;
    targetRole: string;
    targetHotelID?: number | null;
    targetBranchID: number;
}

