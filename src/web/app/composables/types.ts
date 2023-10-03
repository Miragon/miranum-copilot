import { Prompt } from "../../../shared/types";

export interface VscState<T> {
    data: T;
}

export interface TemplatePrompts {
    categories: Category[];
}

interface Category {
    name: string;
    prompts: Prompt[];
}
