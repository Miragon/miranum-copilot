import { WebviewApi } from "vscode-webview";
import { VscMessage, VscState } from "../../shared/types";

export class StateController {
    private vscode: WebviewApi<VscState<JSON>>;

    constructor() {
        this.vscode = acquireVsCodeApi();
    }

    public getState(): VscState<JSON> | undefined {
        return this.vscode.getState();
    }

    public setState(state: VscState<JSON>) {
        this.vscode.setState(state);
    }

    public updateState(state: VscState<JSON>) {
        this.setState({
            ...state,
        });
    }

    public postMessage(message: VscMessage<string>) {
        this.vscode.postMessage(message);
    }
}
