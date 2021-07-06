interface TryResetPasswordReturn {
    success: boolean;
    message: string;
}
export declare const tryResetPassword: (userName: string, oldPasswordPlain: string, newPasswordPlain: string) => Promise<TryResetPasswordReturn>;
export {};
