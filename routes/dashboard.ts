import { Router } from "express";

import { handler as handler_dashboard } from "../handlers/dashboard-get/dashboard";

import { handler as handler_doChangePassword } from "../handlers/dashboard-post/doChangePassword";
import { handler as handler_doGetDefaultConfigProperties } from "../handlers/dashboard-post/doGetDefaultConfigProperties";


const router = Router();


router.get("/", handler_dashboard);


router.post("/doChangePassword", handler_doChangePassword);


router.all("/doGetDefaultConfigProperties", handler_doGetDefaultConfigProperties);


export = router;
