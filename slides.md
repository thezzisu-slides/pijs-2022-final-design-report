---
theme: seriph
background: /background.jpg
class: text-center
highlighter: shiki
lineNumbers: true
info: |
  ## PiJS Final Design Report
  & Prototype Design for [ChiJS Project](github.com/thezzisu/chi)

  Background Art credit: [大核斧子](https://www.pixiv.net/users/73955870)
drawings:
  persist: false
download: true
title: PiJS Final Design Report
---

# PiJS Final Design Report

& Prototype Design for ChiJS Project

<div class="abs-tl m-6 flex gap-2 opacity-70">
  <img src="/PKULogo.svg" class="w-16" >
  <img src="/chi.svg" class="w-16" >
</div>

<div class="abs-br m-6 flex gap-2">
  <a href="https://github.com/thezzisu-slides/pijs-2022-final-design-report" target="_blank" alt="GitHub"
    class="text-xl icon-btn opacity-50 !border-none !hover:text-white">
    <carbon-logo-github />
  </a>
</div>

<!--
[ChiJS Repo](https://github.com/thezzisu/chi)
-->

---

# What is ChiJS?

<br>

ChiJS is a framwork to bring **Developer Oriented Tools** to **General Users**.

Specifically, we provide:

- Low-overhead and fully-typed **RPC implementation**
- Context-isolated and loosely coupled **Plugin system**
- Modern, extendable and reusable **GUI**
- Novel user-interactable and composable **Actions and Tasks**

---
layout: section
---

# Background


---

# Background
## JavaScript ecosystem: the Plugin problem

- Lot's of JS framworks supports 'plugin' to make them extendable
- How to implement the plugin function?
  - Load plugin (JS module or simply a function) into main program
  - Use events/hooks to inject specific code into execution flow and change origin behavior
  - Example:
    - Express, Fastify
    - Webpack, Vite
    - KoishiJS
- In this slide, we call this implementation method `module based plugins`


---

# The Plugin problem
## Module based plugins
- Q: How to share functions between plugins?
- To this question, some framworks has given their best practice
- Example: [KoishiJS Service](https://koishi.js.org/guide/plugin/service.html#%E6%9C%8D%E5%8A%A1%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)
- The core concept here is **D**ependency **I**njection or **I**nverse **o**f **C**ontrol
- Plugin inject custom property to (somehow) global objects, then other plugins could use them
- Typing is archived using TypeScript declartion merging


---

# The Plugin problem
## Module based plugins
- Pros:
  - Easy to implement
  - Fast since all code are running in the same process & v8 instance
  - Enjoy full JavaScript magics
- Cons:
  - 🤯 Plugin side-effects
    - Example: two plugins use `dotenv` to inject a **same** env key
  - 😂 One crash, all crash
    - Example: one plugin uses FFI to call native function and causes the whole node.js process to crash
  - 🤔 Same plugin, multiple instance
    - Though the same function could be archived using configurations, but it makes plugin implementation more complex


---

# The Plugin problem

- However, there are other ways to implement plugins
- We could load plugins into separate processes and communicate with them using IPC
- Example: [VSCode extension host](https://code.visualstudio.com/api/advanced-topics/extension-host)
- In this slide, we call this implementation method `process based plugins`


---

# The Plugin problem
## Process based plugins
- Props:
  - 😋 No side-effects
    - Naturally supports HMR
  - 😎 Plugin crash will not affect other parts of the program
  - 👭 Allow multiple instance (if you wish...)
- Cons:
  - Performance is not as good as module based plugins
    - IPC requires resources
  - Communication between plugins must be serializable
    - IPC requires serialization
  - Hard to support typings


---

# The Plugin problem
- In ChiJS, we implemented a **process based** plugin system
- A low-overhead **RPC** mechanism is provided
- Typeing is archived using **global type injection** based on TypeScript declartion merging


---

# Background
## JavaScript ecosystem: the Type problem

- Normally, when using TypeScript, we just need to import desired variables which are narually typed

```ts
// add.ts
export async function add(a: number, b: number): number {}
// main.ts
import { add } from './add.js'
```

- But in some scenario, we need to indirectly/remotely use a function or variable, which couldn't be archived through `import`
- Suppose we have a RESTful service `adder` which provides a single method `add`
```ts
// service.ts
export async function add(a: number, b: number): number {}
registerEndpoint(add)
// client.ts
const client = new Client('http://localhost:3000')
const c = await client.add(1, 2) // <- How to automatically type this?
```


---

# The Type Problem
- Solution 1: Code generator
- Since we have access to the whole code...
- We can analysis the service code (or the running service), then generate client code!
- Examples: [Swagger Codegen](https://swagger.io/tools/swagger-codegen/) and [ProtoBuf](https://developers.google.com/protocol-buffers)
- Pros:
  - Intuitive
  - Not limited to the JavaScript world
  - Flexible
- Cons:
  - 🤯 Analyzing JavaScript code is really, super, exterme **HARD**
  - 😢 Typings are **complex** as they may dependes on other types
  - Thus, we need to write **schemas** for APIs which brings duplication of work


---

# The Type Problem
## Code generator pseudo code
```ts
async function add(a: number, b: number): number {}
const schema = {
  props: [
    { type: 'number' },
    { type: 'number' }
  ],
  returns: {
    type: 'number'
  }
}
registerEndpoint(schema, add)
```
- Not DRY
- Requires additional checks on schema and type consistency
- Personally, this method is not preferable


---

# The Type Problem
- Solution 2: `import type` and type functions
- Use `import type` to prevent TypeScript generating real import statements
- Use type functions to transform types
- Pros:
  - No need to generate code - avoids lots of problems!
  - Complex types are supported
- Cons:
  - Dependency problem
    - We just need the type, not the implementation!
  - Requires some TS tricks, which leads to ninja code (hard to understand)


---

# The Type Problem
## import type and type function pseudo code
```ts
// service.ts
export async function add(a: number, b: number): number {}
registerEndpoint(add)
// client.ts
import type { add } from './service.js'
const client = new Client<{add: add}>('https://localhost:3000')
const result = await client.add(1, 2)
```


---

# The Type Problem
- For the second solution, we can do more optimizations:
- Use `Type Injection` instead of `import type`
- Split type definition from implementation
- Example pseudo code using our method:
```ts
// plugin.ts
type SelfDescriptor = PluginTypeDescriptor<{ foo(bar: string): number }>
declare module '@chijs/core' {
  interface IPluginDescriptors {
    '~/plugin.ts': SelfDescriptor
  }
}
new PluginBuilder<SelfDescriptor>().build((ctx) => {
	endpoint.provide('foo', (bar) => +bar) // Type checked!
})
// another-plugin.ts
...
const proxy = await ctx.getServiceProxy<DescriptorOf<'~/plugin.ts'>>('some-service')
const result = proxy.foo('123') // 123
```

---

# Background
## JavaScript ecosystem: the UI problem

- To write a GUI or not to write, that is the question
- A few months ago, I write JS code for 5min to implement a AC remote, but spent more then 5hr on turning it into a SPA 😂
- Is there a way to implement basic user interaction without wasting time on GUI?


---

# Background
- The RPC implemention is based on a primitive version I wrote in middle school. It's so true that college life is no easier than high school
- In fact, I was thinking about the type problem back in 2021, and implemented a prototype called `defapi` in the fall semester of that year
- Thanks to this course for giving me the opportunity to put those ideas into practice 😘


---


---


---


---
