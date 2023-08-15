/**
 * Create a way to resolve a Promise manually.
 * @returns - {
 *     wait - Returns the Promise to await
 *     done - Resolves the Promise returned by wait
 * }
 */
export function createResolver() {
    let resolver: (r: string | undefined) => void;
    let promise = new Promise<string | undefined>((resolve) => {
        resolver = (response: string | undefined) => {
            resolve(response);
        };
    });

    function wait() {
        return promise;
    }

    function done(data: string | undefined) {
        resolver(data);
    }

    return { wait, done };
}
