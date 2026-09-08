export const isEnvBrowser = (): boolean =>
    !(window as any).GetParentResourceName;
