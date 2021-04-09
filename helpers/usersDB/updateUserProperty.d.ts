export declare const updateUserProperty: (reqBody: {
    userName: string;
    propertyName: "isAdmin" | "canUpdate" | "canCreate";
    propertyValue: string;
}) => number;
