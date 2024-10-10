import type { User } from '../../types/recordTypes.js';
interface RollForwardOrganizationReturn {
    success: boolean;
    message?: string;
}
export default function rollForwardOrganization(organizationID: number, updateFiscalYear: boolean, updateReminders: boolean, requestUser: User): RollForwardOrganizationReturn;
export {};
