import path from "path";
const __dirname = ".";
export const serviceConfig = {
    name: "Lottery Licence Manager",
    description: "A web application for managing AGCO's municipal lottery licensing requirements in Ontario.",
    script: path.join(__dirname, "bin", "www.js")
};
