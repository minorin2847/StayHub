import type Branch from "./branch.js";

export type BranchTable = Branch & {
    manager_firstname: string;
    manager_lastname: string;
    manager_email: string;
    hotel_count: number;
}