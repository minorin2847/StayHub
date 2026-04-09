
export type CreateEmployeeInput = {
  username: string;
  password: string;
  email: string;
  firstName: string;
  lastName: string;
  salary: number;
  targetRole: string;
  targetBranchID?: number | null;
  targetHotelID?: number | null;
};
