export declare const createUser: (reqBody: {
    userName: string;
    lastName: string;
    firstName: string;
}) => Promise<string | false>;
