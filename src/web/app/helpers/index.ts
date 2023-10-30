import { DefaultPrompt } from "../../../shared";

/**
 * The structure of the pre-defined prompts file.
 * @interface TemplatePrompts
 * @field categories - An array of different categories containing prompts.
 */
export interface TemplatePrompts {
    categories: Category[];
}

/**
 * A category with its prompts.
 * @interface Category
 * @field name - The name of the category.
 * @field prompts - An array of prompts.
 */
interface Category {
    name: string;
    prompts: DefaultPrompt[];
}

/**
 * Create a way to resolve a Promise manually.
 * @returns - {
 *     wait - Returns the Promise to await
 *     done - Resolves the Promise returned by wait
 * }
 */
export function createResolver<T>() {
    let resolver: (r: T | undefined) => void;
    let promise = new Promise<T | undefined>((resolve) => {
        resolver = (response: T | undefined) => {
            resolve(response);
        };
    });

    function wait() {
        return promise;
    }

    function done(data: T | undefined) {
        resolver(data);
    }

    return { wait, done };
}
