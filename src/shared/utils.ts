import {DefaultPrompt, DocumentationPrompt, Prompt} from "./types";

export function isInstanceOfDefaultPrompt(object: Prompt): object is DefaultPrompt {
    return "text" in object;
}

export function isInstanceOfDocumentationPrompt(
    object: Prompt,
): object is DocumentationPrompt {
    return "process" in object && "template" in object && "format" in object;
}
