export let initialize: any = null;

export function initialized(): Promise<string | undefined> {
    return new Promise((resolve) => {
        initialize = (response: string | undefined) => {
            resolve(response);
        };
    });
}
