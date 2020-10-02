import { Service } from "node-windows";
import * as path from "path";

// Create a new service object
const svc = new Service({
  name: "Lottery Licence Manager",
  description: "A web application for managing AGCO's municipal lottery licensing requirements in Ontario.",
  script: path.join(__dirname, "bin", "www.js")
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on("install", () => {
  svc.start();
});

svc.install();
