# **OpenAI Responses API Reference (JavaScript)**

A concise API reference for the OpenAI Responses API, with **JavaScript SDK usage only**. All examples below use the [`openai`](https://www.npmjs.com/package/openai) NPM package.

---

## **Authentication**

* **API Key:** Store securely, never expose in client code.

**Bearer Auth Header Example:**  
// You never put your API key directly in front-end code\!  
const openai \= new OpenAI({ apiKey: process.env.OPENAI\_API\_KEY });

* 

---

## **Create a Model Response**

**Endpoint:** `POST /v1/responses`

**JavaScript SDK Example:**

import OpenAI from "openai";  
const openai \= new OpenAI();

const response \= await openai.responses.create({  
  model: "gpt-4.1",  
  input: "Tell me a three sentence bedtime story about a unicorn."  
});  
console.log(response);

**Request Body Parameters:**

* `input` (string | array) — **Required**: Text, image, or file inputs.  
* `model` (string) — **Required**: Model ID (`gpt-4o`, `o3`, etc).  
* `background` (boolean): Run in background (default: false).  
* `include` (array): Extra output fields, e.g. `file_search_call.results`.  
* `instructions` (string): Add system message/context.  
* `max_output_tokens` (int): Token limit for the response.  
* `metadata` (map): Up to 16 key-value pairs for custom data.  
* `parallel_tool_calls` (boolean): Allow parallel tool calls (default: true).  
* `previous_response_id` (string): For multi-turn conversations.  
* `reasoning` (object): Advanced config (o-series only).  
* `service_tier` (string): Service latency tier (`auto`, `default`, `flex`).  
* `store` (boolean): Store response for later (default: true).  
* `stream` (boolean): Stream output with server-sent events.  
* `temperature` (number): Randomness 0–2 (default: 1).  
* `text` (object): Text/JSON output config.  
* `tool_choice` (string | object): Tool usage strategy.  
* `tools` (array): Tools/functions model can call.  
* `top_p` (number): Nucleus sampling parameter (default: 1).  
* `truncation` (string): `auto` or `disabled` (default: `disabled`).  
* `user` (string): Stable end-user identifier.

**Returns:** A [Response object](https://platform.openai.com/docs/api-reference/responses/object).

---

## **Retrieve a Model Response**

**Endpoint:** `GET /v1/responses/{response_id}`

**JavaScript SDK Example:**

import OpenAI from "openai";  
const openai \= new OpenAI();

const response \= await openai.responses.retrieve("resp\_123");  
console.log(response);

**Params:**

* `response_id` (string, required): Response ID to fetch.  
* `include` (array, optional): Additional output fields.  
* `stream` (boolean, optional): Stream output.

**Returns:** A Response object.

---

## **Delete a Model Response**

**Endpoint:** `DELETE /v1/responses/{response_id}`

**JavaScript SDK Example:**

import OpenAI from "openai";  
const openai \= new OpenAI();

const response \= await openai.responses.del("resp\_123");  
console.log(response);

---

## **Cancel a Model Response**

Only for responses created with `background: true`.

**Endpoint:** `POST /v1/responses/{response_id}/cancel`

**JavaScript SDK Example:**

import OpenAI from "openai";  
const openai \= new OpenAI();

const response \= await openai.responses.cancel("resp\_123");  
console.log(response);

---

## **List Input Items for a Response**

**Endpoint:** `GET /v1/responses/{response_id}/input_items`

**JavaScript SDK Example:**

import OpenAI from "openai";  
const openai \= new OpenAI();

const inputItems \= await openai.responses.inputItems.list("resp\_123");  
console.log(inputItems.data);

**Params:**

* `after` (string): List after this item ID.  
* `before` (string): List before this item ID.  
* `include` (array): Extra fields.  
* `limit` (int): 1–100 (default: 20).  
* `order` (string): `asc` or `desc` (default: `desc`).

**Returns:** A list of input item objects.

---

## **Streaming Responses**

Pass `stream: true` to stream data as it's generated. Handle with EventSource (browser) or compatible event libraries (Node.js):

// With OpenAI's Node SDK you generally handle with async iterator, see SDK docs.

---

## **Common Response Object Fields**

{  
  id: "resp\_xxx",  
  object: "response",  
  created\_at: \<timestamp\>,  
  status: "completed" | "failed" | "in\_progress" | ...,  
  error: null | { code, message },  
  model: "gpt-4o-2024-08-06", // etc  
  output: \[...\],  
  previous\_response\_id: null | string,  
  ...other fields as above...  
}

---

## **Resources & Docs**

* [Official API Reference](https://platform.openai.com/docs/api-reference/responses)  
* [Model Guide](https://platform.openai.com/docs/models)  
* [JavaScript SDK](https://github.com/openai/openai-node)  
* [Quickstart](https://platform.openai.com/docs/quickstart?api-mode=responses)

---

*Generated from OpenAI Docs, JS SDK, and API schema, June 2025\.*

