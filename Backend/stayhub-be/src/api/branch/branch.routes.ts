import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { hasPermission } from "../dashboard/dashboard.handler.js";
import { createBranch, getAllBranches, getBranchFromId } from "./branch.handler.js";

const branchRoute = Router()

branchRoute.post("/create", isLoggedIn,
    hasPermission(['ADMINISTRATOR']),
    createBranch
);

branchRoute.get("/", getAllBranches);

branchRoute.get("/get/:id", isLoggedIn, getBranchFromId);

export default branchRoute;