export interface TemplatePrompts {
    categories: Category[];
}

interface Category {
    name: string;
    prompts: Prompt[];
}

export interface Prompt {
    prompt: string;
    process?: boolean;
    form?: boolean;
    template?: boolean;
}
