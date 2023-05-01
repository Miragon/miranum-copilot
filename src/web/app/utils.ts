export let initialize: any = null;

export function initialized(): Promise<JSON | undefined> {
    return new Promise((resolve) => {
        initialize = (response: JSON | undefined) => {
            resolve(response);
        };
    });
}
