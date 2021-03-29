import * as path from "path";
import type { ServiceConfig } from "node-windows";


export const serviceConfig: ServiceConfig = {
  name: "Lottery Licence Manager",
  description: "A web application for managing AGCO's municipal lottery licensing requirements in Ontario.",
  script: path.join(__dirname, "bin", "www.js")
};
