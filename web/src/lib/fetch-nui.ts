import { isEnvBrowser } from './misc';

export async function fetchNui<T = any>(
    eventName: string,
    data?: any,
    mock?: { data: T; delay?: number },
): Promise<T> {
    if (isEnvBrowser()) {
        if (!mock) return await new Promise((resolve) => resolve);
        await new Promise((resolve) => setTimeout(resolve, mock.delay));
        return mock.data;
    }

    const options = {
        method: 'post',
        headers: {
            'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(data),
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment
    const resourceName = (window as any).GetParentResourceName
        ? // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access,@typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
          (window as any).GetParentResourceName()
        : 'nui-frame-app';

    const resp = await fetch(`https://${resourceName}/${eventName}`, options);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return await resp.json();
}
