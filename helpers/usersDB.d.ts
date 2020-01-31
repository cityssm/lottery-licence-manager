import { User, UserProperties } from "./llmTypes";
export declare const usersDB: {
    getUser: (userNameSubmitted: string, passwordPlain: string) => User;
    tryResetPassword: (userName: string, oldPasswordPlain: string, newPasswordPlain: string) => {
        success: boolean;
        message: string;
    };
    getAllUsers: () => User[];
    getUserProperties: (userName: string) => UserProperties;
    createUser: (reqBody: any) => any;
    updateUser: (reqBody: any) => number;
    updateUserProperty: (reqBody: any) => number;
    generateNewPassword: (userName: string) => string;
};
