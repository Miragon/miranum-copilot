// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as assert from "assert";
import { readFilesFromDirectory } from "../../modules/fs";
import * as path from "path";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", () => {
    vscode.window.showInformationMessage("Start all tests.");

    const testWorkspace = path.resolve(__dirname, "../../../example/my-project");

    test("Sample test", async () => {
        const bpmnFiles = await readFilesFromDirectory("bpmn");

        assert.deepEqual(
            [
                `${testWorkspace}/second-layer/third-layer/third-layer.bpmn`,
                `${testWorkspace}/first-layer.bpmn`,
            ],
            bpmnFiles,
        );
    });
});
