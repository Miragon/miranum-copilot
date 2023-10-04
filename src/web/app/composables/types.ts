import {DefaultPrompt} from "../../../shared";

export interface VscState<T> {
    data: T;
}

export interface TemplatePrompts {
    categories: Category[];
}

interface Category {
    name: string;
    prompts: DefaultPrompt[];
}
