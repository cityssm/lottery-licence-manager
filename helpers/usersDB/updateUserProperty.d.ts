export declare const updateUserProperty: (requestBody: {
    userName: string;
    propertyName: "isAdmin" | "canUpdate" | "canCreate";
    propertyValue: string;
}) => boolean;
