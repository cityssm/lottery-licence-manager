interface GetApplicationSettingsReturn {
    settingKey: string;
    settingName: string;
    settingDescription?: string;
    settingValue?: string;
    orderNumber: number;
    recordUpdate_userName: string;
    recordUpdate_timeMillis: number;
}
export declare const getApplicationSettings: () => GetApplicationSettingsReturn[];
export {};
