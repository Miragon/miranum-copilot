import { Prompt } from "../../../shared/types";

export interface TemplatePrompts {
    categories: Category[];
}

interface Category {
    name: string;
    prompts: Prompt[];
}
