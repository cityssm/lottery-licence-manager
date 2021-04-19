import { getAllUsers } from "../../helpers/usersDB/getAllUsers.js";
export const handler = (_req, res) => {
    const users = getAllUsers();
    res.render("admin-userManagement", {
        headTitle: "User Management",
        users
    });
};
