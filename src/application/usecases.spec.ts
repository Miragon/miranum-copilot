import "reflect-metadata";
import { GetBpmnFilesUseCase } from "./usecases";
import { GetBpmnFilesOutPort } from "./ports/out";
import { BpmnFile } from "./model";
import { expect } from "chai";

describe("get bpmn files", () => {
    class GetBpmnFilesAdapter implements GetBpmnFilesOutPort {
        getBpmnFiles(): Promise<BpmnFile[]> {
            return Promise.resolve([
                new BpmnFile("file1", "workspace1", "full/Path/workspace1/file1.bpmn"),
                new BpmnFile("file2", "workspace2", "full/Path/workspace2/file2.bpmn"),
                new BpmnFile("file3", "workspace2", "full/Path/workspace2/file3.bpmn"),
            ]);
        }
    }

    it("should return bpmn files", async () => {
        const getBpmnFilesUseCase = new GetBpmnFilesUseCase(new GetBpmnFilesAdapter());
        const bpmnFiles = await getBpmnFilesUseCase.getBpmnFiles();

        expect(JSON.stringify(bpmnFiles)).to.equal(
            JSON.stringify([
                new BpmnFile("file1", "workspace1", "full/Path/workspace1/file1.bpmn"),
                new BpmnFile("file2", "workspace2", "full/Path/workspace2/file2.bpmn"),
                new BpmnFile("file3", "workspace2", "full/Path/workspace2/file3.bpmn"),
            ]),
        );
    });
});
