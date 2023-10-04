import {isInstanceOfDefaultPrompt, isInstanceOfDocumentationPrompt} from "./utils";
import {OutputFormat} from "./types";

describe("isInstanceOfDefaultPrompt", () => {
    it("should return true", () => {
        const prompt = JSON.stringify({
            text: "test",
        });

        expect(isInstanceOfDefaultPrompt(JSON.parse(prompt))).toBe(true);
    });
    it("should return false", () => {
        const prompt = JSON.stringify({
            process: "test",
        });

        expect(isInstanceOfDefaultPrompt(JSON.parse(prompt))).toBe(false);
    });
});

describe("isInstanceOfDocumentationPrompt", () => {
    it("should return true", () => {
        const prompt = JSON.stringify({
            process: "test",
            template: "test",
            format: OutputFormat.json,
        });

        expect(isInstanceOfDocumentationPrompt(JSON.parse(prompt))).toBe(true);
    });
    it("should return false", () => {
        const prompt = JSON.stringify({
            text: "test",
        });

        expect(isInstanceOfDocumentationPrompt(JSON.parse(prompt))).toBe(false);
    });
});
