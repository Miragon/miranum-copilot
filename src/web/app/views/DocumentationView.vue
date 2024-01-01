// <script lang="ts" setup>
// import { computed, ref } from "vue";
// import {
//     provideVSCodeDesignSystem,
//     vsCodeButton,
//     vsCodeDropdown,
//     vsCodeOption,
//     vsCodeTextField,
// } from "@vscode/webview-ui-toolkit";
//
// import { BpmnFile, CreateProcessDocumentationCommand, Template } from "../../../shared";
// import { DocumentationViewState, getVsCodeApi, VsCode } from "@/vscode";
// import LoadingAnimation from "@/components/LoadingAnimation.vue";
// import DropdownItem from "@/components/DropdownItem.vue";
//
// provideVSCodeDesignSystem().register(
//     vsCodeButton(),
//     vsCodeDropdown(),
//     vsCodeOption(),
//     vsCodeTextField(),
// );
//
// interface Props {
//     loading: boolean;
//     templates: Template[];
//     bpmnFiles: BpmnFile[];
//     selectedBpmn: BpmnFile | undefined;
// }
//
// const vscode: VsCode = getVsCodeApi();
// const props = defineProps<Props>();
//
// const bpmnFiles = computed(() => props.bpmnFiles);
// const selectedBpmn = computed({
//     get() {
//         return props.selectedBpmn;
//     },
//     set(bpmnFile?: BpmnFile) {
//         return bpmnFile;
//     },
// });
// const templates = computed(() => props.templates);
// const selectedTemplate = ref<Template>(templates.value[0]);
// const documentationFormat = ref(["Markdown", "JSON"]);
// const selectedFormat = ref(documentationFormat.value[0]);
//
// const loading = computed(() => props.loading);
//
// function generateDocumentation() {
//     if (!selectedBpmn.value || selectedBpmn.value?.fullPath === "") {
//         console.error("No BPMN file selected");
//         return;
//     }
//     const createProcessDocumentationCommand = new CreateProcessDocumentationCommand(
//         selectedBpmn.value,
//         selectedTemplate.value.path,
//         selectedFormat.value,
//     );
//     vscode.postMessage(createProcessDocumentationCommand);
// }
//
// function selectBpmn(element: HTMLOptionElement, bpmnFile: BpmnFile) {
//     if (bpmnFile.fullPath === selectedBpmn.value?.fullPath) {
//         element.setAttribute("selected", "selected");
//     }
// }
//
// function handleSelectedBpmn(bpmnFile: BpmnFile) {
//     selectedBpmn.value = bpmnFile;
//     const documentationViewState = vscode.getState(
//         "DocumentationViewState",
//     ) as DocumentationViewState;
//     vscode.setState(
//         new DocumentationViewState(
//             documentationViewState.templates,
//             documentationViewState.bpmnFiles,
//             documentationViewState.prompts,
//             documentationViewState.selectedBpmnFile,
//             selectedBpmn.value,
//         ),
//     );
// }
//
// function handleSelectedTemplate(template: Template) {
//     selectedTemplate.value = template;
//     vscode.updateState({
//         currentPrompt: {
//             ...vscode.getState().currentPrompt,
//             process: bpmnFile,
//         },
//     });
// }
//
// function handleSelectedFormat(format: OutputFormat) {
//     vscode.updateState({
//         currentPrompt: {
//             ...vscode.getState().currentPrompt,
//             format: format,
//         },
//     });
// }
// </script>
//
// <template>
//     <vscode-dropdown v-if="bpmnFiles?.length > 0">
//         <vscode-option
//             v-for="bpmnFile in bpmnFiles"
//             :key="bpmnFile.fullPath"
//             :ref="(el: HTMLOptionElement) => selectBpmn(el, bpmnFile)"
//             @click="handleSelectedBpmn(bpmnFile)"
//         >
//             <DropdownItem :name="bpmnFile.fileName" :prefix="bpmnFile.workspaceName" />
//         </vscode-option>
//     </vscode-dropdown>
//     <vscode-dropdown>
//         <vscode-option
//             v-for="template in templates"
//             :key="template.path"
//             @click="handleSelectedTemplate(template)"
//         >
//             {{ template.name }}
//         </vscode-option>
//     </vscode-dropdown>
//     <vscode-dropdown>
//         <vscode-option
//             v-for="format in documentationFormat"
//             :key="format"
//             @click="handleSelectedFormat(format)"
//         >
//             {{ format }}
//         </vscode-option>
//     </vscode-dropdown>
//     <div v-if="!loading">
//         <vscode-button @click="generateDocumentation">Generate</vscode-button>
//     </div>
//     <div v-else class="loading">
//         <LoadingAnimation />
//     </div>
// </template>
//
// <style scoped>
// vscode-text-field {
//     min-height: inherit;
//     width: 100%;
//     margin-bottom: var(--margin);
//     padding: 10px;
//     border-radius: 4px;
//     border: 1px solid var(--vscode-dropdown-background);
// }
//
// vscode-dropdown {
//     min-height: inherit;
//     width: 100%;
//     margin-bottom: var(--margin);
// }
//
// vscode-button {
//     width: 100%;
//     padding: 10px;
//     transition: background-color 0.3s ease;
// }
//
// .loading {
//     display: grid;
//     min-height: inherit;
//     align-content: center;
//     justify-content: center;
// }
// </style>
