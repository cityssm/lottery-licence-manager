import { Router } from "express";

import { handler as handler_dashboard } from "../handlers/dashboard-get/dashboard.js";

import { handler as handler_doChangePassword } from "../handlers/dashboard-post/doChangePassword.js";
import { handler as handler_doGetDefaultConfigProperties } from "../handlers/dashboard-post/doGetDefaultConfigProperties.js";


export const router = Router();


router.get("/", handler_dashboard);


router.post("/doChangePassword", handler_doChangePassword);


router.all("/doGetDefaultConfigProperties", handler_doGetDefaultConfigProperties);
