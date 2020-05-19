export type llmGlobal = {

  arrayToObject?: (array: [], objectKey: any) => {},

  getDefaultConfigProperty?: (propertyName: string, propertyValueCallbackFn: (any) => void) => void,

  initializeDateRangeSelector?: (containerEle: HTMLElement, changeFn: () => void) => void,

  initializeTabs?: (tabsListEle: HTMLElement, callbackFns?: {
    onshown?: (tabContentEle: HTMLElement) => void
  }) => void
};
