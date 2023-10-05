**You:**

<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:di="http://www.omg.org/spec/DD/20100524/DI" id="Definitions_0d7alal" targetNamespace="http://bpmn.io/schema/bpmn" exporter="bpmn-js (https://demo.bpmn.io)" exporterVersion="12.0.0">
  <bpmn:process id="Process_1701f61" name="Cooking Process" isExecutable="false">
    <bpmn:startEvent id="Event_1huyz9d" name="Hunger noted">
      <bpmn:outgoing>Flow_09b83pq</bpmn:outgoing>
    </bpmn:startEvent>
    <bpmn:sequenceFlow id="Flow_09b83pq" sourceRef="Event_1huyz9d" targetRef="Activity_1lyfg6c" />
    <bpmn:exclusiveGateway id="Gateway_0hrykqx" name="Desired dish?">
      <bpmn:incoming>Flow_06m65q8</bpmn:incoming>
      <bpmn:outgoing>Flow_0saefyh</bpmn:outgoing>
      <bpmn:outgoing>Flow_1d7dtjy</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_06m65q8" sourceRef="Activity_1lyfg6c" targetRef="Gateway_0hrykqx" />
    <bpmn:sequenceFlow id="Flow_0saefyh" name="Pasta" sourceRef="Gateway_0hrykqx" targetRef="Activity_0dy01lz" />
    <bpmn:sequenceFlow id="Flow_1d7dtjy" name="Steak" sourceRef="Gateway_0hrykqx" targetRef="Activity_1j0obb2" />
    <bpmn:exclusiveGateway id="Gateway_01iutt1">
      <bpmn:incoming>Flow_0d241vt</bpmn:incoming>
      <bpmn:incoming>Flow_1kxe0x0</bpmn:incoming>
      <bpmn:outgoing>Flow_1qgpibb</bpmn:outgoing>
    </bpmn:exclusiveGateway>
    <bpmn:sequenceFlow id="Flow_0d241vt" sourceRef="Activity_0dy01lz" targetRef="Gateway_01iutt1" />
    <bpmn:sequenceFlow id="Flow_1kxe0x0" sourceRef="Activity_1j0obb2" targetRef="Gateway_01iutt1" />
    <bpmn:sequenceFlow id="Flow_1qgpibb" sourceRef="Gateway_01iutt1" targetRef="Activity_0yyl6t8" />
    <bpmn:endEvent id="Event_1x6w9hd" name="Hunger satisfied">
      <bpmn:incoming>Flow_02uaoq7</bpmn:incoming>
    </bpmn:endEvent>
    <bpmn:sequenceFlow id="Flow_02uaoq7" sourceRef="Activity_0yyl6t8" targetRef="Event_1x6w9hd" />
    <bpmn:userTask id="Activity_1lyfg6c" name="Choose recipe">
      <bpmn:incoming>Flow_09b83pq</bpmn:incoming>
      <bpmn:outgoing>Flow_06m65q8</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Activity_0dy01lz" name="Cook pasta">
      <bpmn:incoming>Flow_0saefyh</bpmn:incoming>
      <bpmn:outgoing>Flow_0d241vt</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Activity_1j0obb2" name="Fry steak">
      <bpmn:incoming>Flow_1d7dtjy</bpmn:incoming>
      <bpmn:outgoing>Flow_1kxe0x0</bpmn:outgoing>
    </bpmn:userTask>
    <bpmn:userTask id="Activity_0yyl6t8" name="Eat meal">
      <bpmn:incoming>Flow_1qgpibb</bpmn:incoming>
      <bpmn:outgoing>Flow_02uaoq7</bpmn:outgoing>
    </bpmn:userTask>
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_1">
    <bpmndi:BPMNPlane id="BPMNPlane_1" bpmnElement="Process_1701f61">
      <bpmndi:BPMNShape id="Event_1huyz9d_di" bpmnElement="Event_1huyz9d">
        <dc:Bounds x="192" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="177" y="165" width="67" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_0hrykqx_di" bpmnElement="Gateway_0hrykqx" isMarkerVisible="true">
        <dc:Bounds x="435" y="115" width="50" height="50" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="426" y="93" width="68" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Gateway_01iutt1_di" bpmnElement="Gateway_01iutt1" isMarkerVisible="true">
        <dc:Bounds x="765" y="115" width="50" height="50" />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Event_1x6w9hd_di" bpmnElement="Event_1x6w9hd">
        <dc:Bounds x="1032" y="122" width="36" height="36" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="1011" y="165" width="80" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0pjq1ps_di" bpmnElement="Activity_1lyfg6c">
        <dc:Bounds x="280" y="100" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_0to5ydu_di" bpmnElement="Activity_0dy01lz">
        <dc:Bounds x="610" y="100" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_1llgi2b_di" bpmnElement="Activity_1j0obb2">
        <dc:Bounds x="610" y="210" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNShape id="Activity_00nic1o_di" bpmnElement="Activity_0yyl6t8">
        <dc:Bounds x="870" y="100" width="100" height="80" />
        <bpmndi:BPMNLabel />
      </bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Flow_09b83pq_di" bpmnElement="Flow_09b83pq">
        <di:waypoint x="228" y="140" />
        <di:waypoint x="280" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_06m65q8_di" bpmnElement="Flow_06m65q8">
        <di:waypoint x="380" y="140" />
        <di:waypoint x="435" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0saefyh_di" bpmnElement="Flow_0saefyh">
        <di:waypoint x="485" y="140" />
        <di:waypoint x="610" y="140" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="533" y="122" width="29" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1d7dtjy_di" bpmnElement="Flow_1d7dtjy">
        <di:waypoint x="460" y="165" />
        <di:waypoint x="460" y="250" />
        <di:waypoint x="610" y="250" />
        <bpmndi:BPMNLabel>
          <dc:Bounds x="533" y="233" width="29" height="14" />
        </bpmndi:BPMNLabel>
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_0d241vt_di" bpmnElement="Flow_0d241vt">
        <di:waypoint x="710" y="140" />
        <di:waypoint x="765" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1kxe0x0_di" bpmnElement="Flow_1kxe0x0">
        <di:waypoint x="710" y="250" />
        <di:waypoint x="790" y="250" />
        <di:waypoint x="790" y="165" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_1qgpibb_di" bpmnElement="Flow_1qgpibb">
        <di:waypoint x="815" y="140" />
        <di:waypoint x="870" y="140" />
      </bpmndi:BPMNEdge>
      <bpmndi:BPMNEdge id="Flow_02uaoq7_di" bpmnElement="Flow_02uaoq7">
        <di:waypoint x="970" y="140" />
        <di:waypoint x="1032" y="140" />
      </bpmndi:BPMNEdge>
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>

For the underlying process Generate a process documentation as text

------------------

**ChatGPT:**

Certainly! Below is a textual process documentation generated based on the provided BPMN (Business Process Model and Notation) XML:

_____________________________________________________________________________________________
## Process Documentation: Cooking Process
### Process Overview
The Cooking Process defines a sequence of tasks to prepare a meal based on the user's hunger and desired dish choice. It starts with recognizing hunger and proceeds with choosing a recipe, cooking the selected dish (pasta or steak), and concludes with the consumption of the meal.

### Process Flow

- **Start Event: Hunger noted**
   - Triggered when hunger is recognized.
   - Initiates the cooking process.
- **Choose Recipe**
   - A user task where the choice of the desired dish (pasta or steak) is made.
   - Outgoing flow based on the selected recipe.
- **Desired Dish? (Exclusive Gateway)**
   - Evaluates the desired dish choice (pasta or steak).
   - Routes the process flow based on the choice made.
   - If Pasta:
      - Cook Pasta task is executed.
   - If Steak:
      - Fry Steak task is executed.
   - **Cook Pasta**
   - A user task to cook pasta.
- **Fry Steak**
   - A user task to fry steak.
- **Desired Dish? (Exclusive Gateway)**
   - Evaluates the successful completion of cooking the desired dish.
   - Routes the process flow accordingly.
- **Eat Meal**
   - A user task to eat the prepared meal.
- **End Event: Hunger Satisfied**
   - Concludes the cooking process when the meal is consumed.

### Task Details

- **Choose Recipe**
   - Description: Allows the user to choose between cooking pasta or frying steak.
   - Input: User's choice of desired dish (pasta or steak).
   - Output: Selected recipe.

<li>**Cook Pasta**


- Description: Involves cooking pasta according to a predefined recipe.
- Input: Raw pasta, water, sauce, and seasoning.
- Output: Cooked pasta dish.

<li>**Fry Steak**


- Description: Involves frying a steak according to a predefined recipe.
- Input: Raw steak, oil, seasoning.
- Output: Cooked steak dish.

<li>**Eat Meal**


- Description: Allows the user to consume the prepared meal.
- Input: Cooked pasta or steak dish.
- Output: Satisfied hunger.

### Conclusion
The Cooking Process efficiently guides the user through the selection and preparation of a desired dish, leading to a satisfying meal. The process flow ensures a seamless transition from recognizing hunger to fulfilling it by consuming a well-prepared meal.

_____________________________________________________________________________________________
This documentation provides an overview of the Cooking Process, including the process flow, task details, and the overall goal of the process.



------------------

**You:**

Generate a process documentation as a .json file

------------------

**ChatGPT:**

To generate a process documentation in JSON format, I'll structure the information in a way that represents the process overview, process flow, task details, and conclusion in a JSON structure. Note that this is a representation of the information in a JSON-like structure and should be saved in a .json file format:

```json<button class="flex ml-auto gizmo:ml-0 gap-2 items-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button>
{
  "process": {
    "name": "Cooking Process",
    "description": "The Cooking Process defines a sequence of tasks to prepare a meal based on the user's hunger and desired dish choice. It starts with recognizing hunger and proceeds with choosing a recipe, cooking the selected dish (pasta or steak), and concludes with the consumption of the meal."
  },
  "processFlow": {
    "steps": [
      {
        "id": "startEvent",
        "name": "Hunger noted",
        "type": "startEvent",
        "description": "Triggered when hunger is recognized. Initiates the cooking process.",
        "outgoing": "Flow_09b83pq"
      },
      {
        "id": "chooseRecipe",
        "name": "Choose Recipe",
        "type": "userTask",
        "description": "A user task where the choice of the desired dish (pasta or steak) is made. Outgoing flow based on the selected recipe.",
        "incoming": "Flow_09b83pq",
        "outgoing": "Flow_06m65q8"
      },
      {
        "id": "desiredDishGateway",
        "name": "Desired Dish? (Exclusive Gateway)",
        "type": "exclusiveGateway",
        "description": "Evaluates the desired dish choice (pasta or steak). Routes the process flow based on the choice made.",
        "incoming": "Flow_06m65q8",
        "outgoing": ["Flow_0saefyh", "Flow_1d7dtjy"]
      },
      {
        "id": "cookPasta",
        "name": "Cook Pasta",
        "type": "userTask",
        "description": "A user task to cook pasta.",
        "incoming": "Flow_0saefyh",
        "outgoing": "Flow_0d241vt"
      },
      {
        "id": "frySteak",
        "name": "Fry Steak",
        "type": "userTask",
        "description": "A user task to fry steak.",
        "incoming": "Flow_1d7dtjy",
        "outgoing": "Flow_1kxe0x0"
      },
      {
        "id": "desiredDishGateway2",
        "name": "Desired Dish? (Exclusive Gateway)",
        "type": "exclusiveGateway",
        "description": "Evaluates the successful completion of cooking the desired dish. Routes the process flow accordingly.",
        "incoming": ["Flow_0d241vt", "Flow_1kxe0x0"],
        "outgoing": "Flow_1qgpibb"
      },
      {
        "id": "eatMeal",
        "name": "Eat Meal",
        "type": "userTask",
        "description": "A user task to eat the prepared meal.",
        "incoming": "Flow_1qgpibb",
        "outgoing": "Flow_02uaoq7"
      },
      {
        "id": "endEvent",
        "name": "Hunger Satisfied",
        "type": "endEvent",
        "description": "Concludes the cooking process when the meal is consumed.",
        "incoming": "Flow_02uaoq7"
      }
    ]
  },
  "taskDetails": {
    "chooseRecipe": {
      "description": "Allows the user to choose between cooking pasta or frying steak.",
      "inputs": "User's choice of desired dish (pasta or steak).",
      "outputs": "Selected recipe"
    },
    "cookPasta": {
      "description": "Involves cooking pasta according to a predefined recipe.",
      "inputs": "Raw pasta, water, sauce, and seasoning.",
      "outputs": "Cooked pasta dish"
    },
    "frySteak": {
      "description": "Involves frying a steak according to a predefined recipe.",
      "inputs": "Raw steak, oil, seasoning.",
      "outputs": "Cooked steak dish"
    },
    "eatMeal": {
      "description": "Allows the user to consume the prepared meal.",
      "inputs": "Cooked pasta or steak dish.",
      "outputs": "Satisfied hunger"
    }
  },
  "conclusion": {
    "description": "The Cooking Process efficiently guides the user through the selection and preparation of a desired dish, leading to a satisfying meal. The process flow ensures a seamless transition from recognizing hunger to fulfilling it by consuming a well-prepared meal."
  }
}

```
You can save the above structure into a .json file for use in your application.



------------------

**You:**

Generate a process documentation as a .md

------------------

**ChatGPT:**

Certainly! Below is a Markdown (.md) formatted process documentation:

_____________________________________________________________________________________________
# Process Documentation: Cooking Process
## Process Overview
The **Cooking Process** defines a sequence of tasks to prepare a meal based on the user's hunger and desired dish choice. It starts with recognizing hunger and proceeds with choosing a recipe, cooking the selected dish (pasta or steak), and concludes with the consumption of the meal.

## Process Flow

- **Start Event: Hunger noted**
   - Triggered when hunger is recognized.
   - Initiates the cooking process.
- **Choose Recipe**
   - A user task where the choice of the desired dish (pasta or steak) is made.
   - Input: User's choice of desired dish (pasta or steak).
   - Output: Selected recipe.
   - Outgoing flow based on the selected recipe.
- **Desired Dish? (Exclusive Gateway)**
   - Evaluates the desired dish choice (pasta or steak).
   - Routes the process flow based on the choice made.
   - If Pasta:
      - Cook Pasta task is executed.
   - If Steak:
      - Fry Steak task is executed.
   - **Cook Pasta**
   - A user task to cook pasta.
   - Input: Raw pasta, water, sauce, and seasoning.
   - Output: Cooked pasta dish.
- **Fry Steak**
   - A user task to fry steak.
   - Input: Raw steak, oil, seasoning.
   - Output: Cooked steak dish.
- **Desired Dish? (Exclusive Gateway)**
   - Evaluates the successful completion of cooking the desired dish.
   - Routes the process flow accordingly.
- **Eat Meal**
   - A user task to eat the prepared meal.
   - Input: Cooked pasta or steak dish.
   - Output: Satisfied hunger.
- **End Event: Hunger Satisfied**
   - Concludes the cooking process when the meal is consumed.

## Task Details

- **Choose Recipe**
   - Description: Allows the user to choose between cooking pasta or frying steak.
   - Inputs: User's choice of desired dish (pasta or steak).
   - Outputs: Selected recipe.

<li>**Cook Pasta**


- Description: Involves cooking pasta according to a predefined recipe.
- Inputs: Raw pasta, water, sauce, and seasoning.
- Outputs: Cooked pasta dish.

<li>**Fry Steak**


- Description: Involves frying a steak according to a predefined recipe.
- Inputs: Raw steak, oil, seasoning.
- Outputs: Cooked steak dish.

<li>**Eat Meal**


- Description: Allows the user to consume the prepared meal.
- Inputs: Cooked pasta or steak dish.
- Outputs: Satisfied hunger.

## Conclusion
The **Cooking Process** efficiently guides the user through the selection and preparation of a desired dish, leading to a satisfying meal. The process flow ensures a seamless transition from recognizing hunger to fulfilling it by consuming a well-prepared meal.

_____________________________________________________________________________________________
You can copy the above Markdown content and save it with a .md extension for use in your project.



------------------

**You:**

Generate a process documentation as a .json file using the following json schema template:

{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Process Documentation",
  "description": "A template for documenting a (business) process.",
  "required": [
    "process",
    "processResponsibility",
    "input",
    "supplierOfInput",
    "processSteps",
    "output",
    "customerOfOutput",
    "itSystems",
    "resources"
  ],
  "type": "object",
  "properties": {
	"process": {
      "description": "Your task is to generate a name for the given process.",
      "type": "string"
    },
	"processResponsibility": {
      "description": "Your task is to describe the given process in maximal 3 sentences.",
      "type": "string"
    },
	"input": {
      "description": "Your task is to list all inputParameter in the given process.",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    },
	"supplierOfInput": {
      "description": "Your task is to define from where the inputs come from.",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    },
	"processSteps": {
      "description": "Your task is to list the process steps in their correct order.",
      "type": "array",
      "items": {
        "type": "string"
      }
    },
	"output": {
      "description": "Your task is to list all outputParameter in the given process.",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    },
	"customerOfOutput": {
      "description": "Your task is to define who consumes the output.",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    },
	"metrics": {
      "description": "Your task is to define plausible metrics for the given process.",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    },
	"itSystems": {
      "description": "Your task is to define which different IT-Systems are involved in the given process.",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    },
	"resources": {
      "description": "Your task is to define which resources are needed from the given process.",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true
    }
  }
}

------------------

**ChatGPT:**

Sure, I'll populate the given JSON schema template with the process information:

```json<button class="flex ml-auto gizmo:ml-0 gap-2 items-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button>
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "title": "Process Documentation",
  "description": "A template for documenting a (business) process.",
  "required": [
    "process",
    "processResponsibility",
    "input",
    "supplierOfInput",
    "processSteps",
    "output",
    "customerOfOutput",
    "metrics",
    "itSystems",
    "resources"
  ],
  "type": "object",
  "properties": {
    "process": {
      "description": "The Cooking Process",
      "type": "string"
    },
    "processResponsibility": {
      "description": "The Cooking Process involves selecting and preparing a dish based on user preferences and hunger.",
      "type": "string"
    },
    "input": {
      "description": "Inputs for cooking a meal",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true,
      "default": ["Raw ingredients", "User preferences"]
    },
    "supplierOfInput": {
      "description": "Suppliers providing the raw ingredients",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true,
      "default": ["Grocery stores", "Farmers"]
    },
    "processSteps": {
      "description": "Steps involved in the cooking process",
      "type": "array",
      "items": {
        "type": "string"
      },
      "default": ["Recognize hunger", "Choose recipe", "Cook", "Serve"]
    },
    "output": {
      "description": "Output of the cooking process",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true,
      "default": ["Cooked meal"]
    },
    "customerOfOutput": {
      "description": "Consumers of the cooked meal",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true,
      "default": ["End consumers"]
    },
    "metrics": {
      "description": "Metrics to measure the efficiency and success of the cooking process",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true,
      "default": ["Time taken", "Customer satisfaction"]
    },
    "itSystems": {
      "description": "IT Systems used in the cooking process",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true,
      "default": ["Recipe app", "Kitchen appliances"]
    },
    "resources": {
      "description": "Resources needed for the cooking process",
      "type": "array",
      "items": {
        "type": "string"
      },
      "uniqueItems": true,
      "default": ["Ingredients", "Cooking utensils", "Knowledge"]
    }
  }
}

```
This JSON structure adheres to the provided JSON schema template and includes information related to the Cooking Process. Feel free to modify the content or defaults as needed.



------------------

**You:**

Generate a process documentation as a .json file using the following .md template:



# Documentation

## Process
<!-- 
instruction: "Your task is to generate a name for the given process."
format: "text"
example: "Order Process"
-->

## Process Responsibility
<!-- 
instruction: "Your task is to describe the given process in maximal 3 sentences."
format: "text"
example: "This process describes the steps that take place from the receipt of an order to the delivery of the goods."
-->

## Input
<!--
instruction: "Your task is to list all inputParameter in the given process."
format: "unordered list"
example: [
    "Customer Information",
    "Desired date of delivery"
]
-->

## Supplier Of Input
<!--
instruction: "Your task is to define from where the inputs come from."
format: "unordered list"
example: [
    "Order"
]
-->

## Process Steps
<!--
instruction: "Your task is to list the process steps in their correct order.",
format: "ordered list",
example: [
    "Order received",
    "Order checked",
    "If ok, send order confirmation",
    "If no, send cancellation",
    "Deliver goods"
]
-->

## Output
<!--
instruction: "Your task is to list all outputParameter in the given process.",
format: "unordered list",
example: [
    "Bill of delivery"
]
-->

## Customer Of Output
<!--
instruction: "Your task is to define who consumes the output.",
format: "unordered list",
example: [
    "Accounting"
]
-->

## Metrics
<!--
instruction: "Your task is to define plausible metrics for the given process.",
format: "unordered list",
example: [
    "Time taken from receiving the order to deliver the goods",
    "Number of deliveries"
]
-->

## IT-Systems
<!--
instruction: "Your task is to define which different IT-Systems are involved in the given process.",
format: "unordered list",
example: [
    "ERP-System"
]
-->

## Resources
<!--
instruction: "Your task is to define which resources are needed from the given process.",
format: "unordered list",
example: [
    "Order Processing Department",
    "Goods Issuing Department"
]
-->

------------------

**ChatGPT:**

Sure, I'll generate a JSON representation based on the provided Markdown template:

```json<button class="flex ml-auto gizmo:ml-0 gap-2 items-center"><svg stroke="currentColor" fill="none" stroke-width="2" viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round" class="icon-sm" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect></svg>Copy code</button>
{
  "Documentation": {
    "Process": {
      "instruction": "Your task is to generate a name for the given process.",
      "format": "text",
      "example": "Cooking Process"
    },
    "Process Responsibility": {
      "instruction": "Your task is to describe the given process in maximal 3 sentences.",
      "format": "text",
      "example": "This process involves selecting and preparing a dish based on user preferences and hunger."
    },
    "Input": {
      "instruction": "Your task is to list all inputParameter in the given process.",
      "format": "unordered list",
      "example": [
        "Raw ingredients",
        "User preferences"
      ]
    },
    "Supplier Of Input": {
      "instruction": "Your task is to define from where the inputs come from.",
      "format": "unordered list",
      "example": [
        "Grocery stores",
        "Farmers"
      ]
    },
    "Process Steps": {
      "instruction": "Your task is to list the process steps in their correct order.",
      "format": "ordered list",
      "example": [
        "Recognize hunger",
        "Choose recipe",
        "Cook",
        "Serve"
      ]
    },
    "Output": {
      "instruction": "Your task is to list all outputParameter in the given process.",
      "format": "unordered list",
      "example": [
        "Cooked meal"
      ]
    },
    "Customer Of Output": {
      "instruction": "Your task is to define who consumes the output.",
      "format": "unordered list",
      "example": [
        "End consumers"
      ]
    },
    "Metrics": {
      "instruction": "Your task is to define plausible metrics for the given process.",
      "format": "unordered list",
      "example": [
        "Time taken",
        "Customer satisfaction"
      ]
    },
    "IT-Systems": {
      "instruction": "Your task is to define which different IT-Systems are involved in the given process.",
      "format": "unordered list",
      "example": [
        "Recipe app",
        "Kitchen appliances"
      ]
    },
    "Resources": {
      "instruction": "Your task is to define which resources are needed from the given process.",
      "format": "unordered list",
      "example": [
        "Ingredients",
        "Cooking utensils",
        "Knowledge"
      ]
    }
  }
}

```
This JSON structure is generated based on the provided .md template, using the specified instructions and examples. Feel free to modify the content or examples as needed.



------------------

