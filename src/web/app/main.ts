import { WebviewApi } from "vscode-webview";

const app = document.getElementById("app");

const state: WebviewApi<{ content: string }> = acquireVsCodeApi();
console.log(state);

if (app) {
    app.innerText = "Hello World";
    state.postMessage({
        type: "alert",
        content: "Alert",
    });
}

window.addEventListener("message", () => {
    if (app) {
        app.innerText = "Hello World";
    }
});
