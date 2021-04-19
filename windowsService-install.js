import { Service } from "node-windows";
import { serviceConfig } from "./windowsService";
const svc = new Service(serviceConfig);
svc.on("install", () => {
    svc.start();
});
svc.install();
