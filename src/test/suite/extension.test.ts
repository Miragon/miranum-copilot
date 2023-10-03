// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as assert from "assert";
import * as path from "path";
import {readFilesFromDirectory} from "../../modules/reader";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", () => {
    vscode.window.showInformationMessage("Start all tests.");

    test("Sample test", () => {
        const projectRoot = path.resolve(__dirname, "../example-project");
        const uri = vscode.Uri.file(projectRoot);

        const bpmnFiles = readFilesFromDirectory(uri, ".bpmn");

        assert.strictEqual(["first-layer.bpmn", "third-layer.bpmn"], bpmnFiles);
    });
});
