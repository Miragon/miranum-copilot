// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from "vscode";
import * as path from "path";
import { expect } from "chai";

import { readFilesFromDirectory } from "../../modules/fs";
// import * as myExtension from '../../extension';

suite("Extension Test Suite", () => {
    vscode.window.showInformationMessage("Start all tests.");

    const testWorkspace = path.resolve(__dirname, "../../../example/my-project");

    test("Read files from workspace", async () => {
        const bpmnFiles = await readFilesFromDirectory("bpmn");

        expect(bpmnFiles).to.have.members([
            `${testWorkspace}/first-layer.bpmn`,
            `${testWorkspace}/second-layer/third-layer/third-layer.bpmn`,
        ]);
    });
});
