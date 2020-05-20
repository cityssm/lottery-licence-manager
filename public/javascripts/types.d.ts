import type * as llmTypes from "../../helpers/llmTypes";
export declare type llmGlobal = {
    arrayToObject?: (array: [], objectKey: any) => {};
    getDefaultConfigProperty?: (propertyName: string, propertyValueCallbackFn: (any: any) => void) => void;
    initializeDateRangeSelector?: (containerEle: HTMLElement, changeFn: () => void) => void;
    initializeTabs?: (tabsListEle: HTMLElement, callbackFns?: {
        onshown?: (tabContentEle: HTMLElement) => void;
    }) => void;
    organizationRemarks?: {
        getRemarksByOrganizationID: (organizationID: number, callbackFn: (remarkList: llmTypes.OrganizationRemark[]) => void) => void;
        getRemarkByID: (organizationID: number, remarkIndex: number, callbackFn: (remark: llmTypes.OrganizationRemark) => void) => void;
        openAddRemarkModal: (organizationID: number, updateCallbackFn: () => void) => void;
        openEditRemarkModal: (organizationID: number, remarkIndex: number, updateCallbackFn: () => void) => void;
        deleteRemark: (organizationID: number, remarkIndex: number, doConfirm: boolean, deleteCallbackFn: (response: {
            success: boolean;
            message: string;
        }) => void) => void;
    };
};
