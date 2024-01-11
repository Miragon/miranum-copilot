export const documentationMarkdownPrompt: string = `
Create a process-documentation in Markdown format (.md) for the specified process.
The generated Markdown must have the structure of the specified template.

The template contains comments (<!-- -->).
The comments are written in a JSON like format.
The comments give you information about the output you should produce.
It is important that you stick to that information from the comment.
Replace the comments in that template with your best guess.
If you don't know what to replace the comments with, just leave them.
`;

export const documentationJsonPrompt: string = `
Create a process documentation as a valid JSON object for the specified process.
`;
