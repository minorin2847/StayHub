import { Router } from "express";
import { isLoggedIn } from "../auth/auth.handler.js";
import { createPolicy, deletePolicy, editPolicy, getPolicyList, getPolicyStats } from "./policy.handler.js";

const policyRoute = Router();

policyRoute.get("/stats", isLoggedIn, getPolicyStats);
policyRoute.get("/list", isLoggedIn, getPolicyList);
policyRoute.post("/create", isLoggedIn, createPolicy);
policyRoute.patch("/edit/:name", isLoggedIn, editPolicy);
policyRoute.delete("/delete/:name", isLoggedIn, deletePolicy);

export default policyRoute;