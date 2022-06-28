---
theme: seriph
background: /background.jpg
favicon: /favicon.ico
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
monaco: true
title: PiJS Final Design Report
---

# PiJS Final Design Report

& Prototype Design of ChiJS Project

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

ChiJS is a **meta framwork** to bring **Developer Oriented Tools** to **General Users**.

Specifically, we provide:

- Low-overhead and fully-typed **RPC implementation**
- Context-isolated and loosely coupled **Plugin system**
- Modern, extendable and reusable **GUI**
- Novel user-interactable and composable **Actions** and **Units**


---
layout: section
---

# Background

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


---

# The Type Problem
- Solution 2: type injection and type calculation
- Use `import type` to prevent TypeScript generating real import statements
- Or use `declartion merging` to globally inject types
- Use type functions to transform types
- Pros:
  - No need to generate code - avoids lots of problems!
  - Complex types are supported
- Cons:
  - Dependency problem
    - We just need the type, not the implementation!
  - Requires some TS tricks


---

# The Type Problem
## import type pseudo code
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
## global injection pseudo code
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

# The Type Problem

- Based on this idea, we implemented a package `@chijs/rpc` to provide a **typed** and **low overhead** generic RPC module, which provides:

  - remote function invocation
  - publish / subscribe
  
  and requires only a reliable connection eg. WebSocket / Node.JS IPC


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
  - 😋 No side-effects: Easy to implement **H**ot **M**odule **R**eloading
  - 😎 Plugin crash will not affect other parts of the program
- Cons:
  - Performance is not as good as module based plugins
    - IPC requires resources
  - Communication between plugins must be serializable
    - IPC requires serialization
  - Hard to support typings


---

# The Plugin problem
- In ChiJS, we implemented a **process based** plugin system
- Typeing is archived using **type injection** and **type computation**
- RPC is fully supported based on `@chijs/rpc`


---

# Background
## JavaScript ecosystem: the UI problem

- To write a GUI or not to write, that is the question
- A few months ago, I write JS code for 5min to implement a AC remote, but spent more then 5hr on turning it into a SPA 😂
- Is there a way to implement basic user interaction without wasting time on GUI?

---

# The UI Problem

- Basic user interaction can be abstracted into a interface with set of methods like
  - alert
  - prompt
  - ...
- User agent is just a component that implements this interface
- We just need to invoke those methods
- If user agent and our code are running in different context, then use RPC to archive it
- By abstracting basic user interactions, we could split the implementation of the frontend and the caller
- Then, we get the ability to implement frontend in **different ways** like WebUI, CLI or even programmatically interact with caller code

---

# The UI Problem

- In chijs, this problem is solved by defining a special RPC Descriptor called `Agent`
- Our frontend implements a RPCEndpoint for Agent
- RPCHandler of Agent is injected into Actions' context
- Then, there's interactable actions😋


---
layout: section
---

# Introduction

---

# Introduction
Expected usages

ChiJS Framwork is capable for
- Wrap programs into services (a bit like systemd lol)
- Wrap scripts into composable actions
- Wrap other framworks/tools into a application running as a web app or desktop app
- ...

Which let you
- say goodbye to command line and do things by just clicks
- expand potential users by lowering barriers to use your tool
- run scripts in background without black windows
- ...


---

# Introduction
Expected usages

And for me, I develop ChiJS for
- Desktop automation
- Daemonlize tools including `serve` and `koishi` with a consistent interface
- Share useful scripts with my friends
- Manage Node.JS processes on my server cluster

However, as a generic framwork, ChiJS have more possibilities subject to use


---

# Introduction
Project structure

The [ChiJS repository](https://github.com/thezzisu/chi) is a monorepo consisting several packages. Core packages that provides basic functionality are:


| Package         | Version                                                              |
| --------------- | -------------------------------------------------------------------- |
| `@chijs/app`    | ![npm](https://img.shields.io/npm/v/@chijs/app?style=flat-square)    |
| `@chijs/client` | ![npm](https://img.shields.io/npm/v/@chijs/client?style=flat-square) |
| `@chijs/rpc`    | ![npm](https://img.shields.io/npm/v/@chijs/rpc?style=flat-square)    |
| `@chijs/ui`     | ![npm](https://img.shields.io/npm/v/@chijs/ui?style=flat-square)     |
| `@chijs/util`   | ![npm](https://img.shields.io/npm/v/@chijs/util?style=flat-square)   |
| `create-chi`    | ![npm](https://img.shields.io/npm/v/create-chi?style=flat-square)    |


---

# Introduction
Project structure

Each package is inside `/packages/<PKGNAME>`

Run `yarn build` at repo root will build all packages by their topo-order, which is required for development

The following slides will brief on those packages
---

# Introduction
[@chijs/util](https://github.com/thezzisu/chi/tree/development/packages/util)

Shared utilities including
- A isomorphic logger based on [pino](https://github.com/pinojs/pino)
- A type-inferable JSON Schema builder based on [sinclairzx81/typebox](https://github.com/sinclairzx81/typebox)
- A unique ID generator based on [nanoid](https://github.com/ai/nanoid)
- Type utilities to prefix / unprefix a object type, spread multiple types, ...

Implementation notes:
- The TypeScript type system itself is also a functional programming langage
- Introduction to Computing (A) (Honor Track) provided the required skill to implement complex calculated types


---

# Introduction
[@chijs/rpc](https://github.com/thezzisu/chi/tree/development/packages/rpc)

<div class="abs-tr m-6">
  <img src="/arch-rpc.svg">
</div>

Typed generic RPC solution

Design:
- RPCRouter & RPCAdapter handle messages between
  
  multiple RPCEndpoints
- RPCEndpoint handles messages and invoke desired functions
- RPCHandle acts as a remote endpoint client and provides
  
  invocate/subscribe APIs

See `src/endpoint.ts` for RPCEndpoint/RPCHandle implementation

`src/router.ts` for RPCRouter/RPCAdapter implementation


---

# Introduction
[@chijs/rpc](https://github.com/thezzisu/chi/tree/development/packages/rpc)

How type works?

In ChiJS, I introduced a new way to manipulate types called `TypeDescriptor`

A `TypeDescriptor` is a **virtual** type which contains abstracted type info for other types

For example, RPCEndpoint and RPCHandle could have their method signatures abstracted

---

# Introduction
[@chijs/rpc](https://github.com/thezzisu/chi/tree/development/packages/rpc)

Code extracted from our implementation:
```ts {monaco}
// @ts-nocheck
interface RpcTypeDescriptor<A extends {}, B extends {}> {
  provide: A
  publish: B
}

class RpcEndpoint<D extends RpcTypeDescriptor<{}, {}>> {
  provide<K extends ProvideKeys<D>>(name: K, fn: WithThis<RpcHandle<D>, ProvideImpl<D, K>>)
  publish<K extends PublishKeys<D>>(name: K, fn: WithThis<RpcHandle<D>, PublishImpl<D, K>>)
}

class RpcHandle<D extends RpcTypeDescriptor<{}, {}>> {
  async call<K extends ProvideKeys<D>>(name: K, ...args: ProvideArgs<D, K>): Promise<Awaited<ProvideReturn<D, K>>>
  async exec<K extends ProvideKeys<D>>(name: K, ...args: ProvideArgs<D, K>): Promise<void>
  async subscribe<K extends PublishKeys<D>>(name: K, cb: PublishCb<D, K>, ...args: PublishArgs<D, K>): Promise<SubscriptionId>
}
```

Actual type of RPCEndpoint and RPCHandle is calculated from their descriptor
---

# Introduction
[@chijs/rpc](https://github.com/thezzisu/chi/tree/development/packages/rpc)

Example usage:
```ts
type Descriptor = RpcTypeDescriptor<{
  foo(bar: string): Promise<number>
}, {}>

endpoint // RPCEndpoint<Descriptor>
  .provide('foo', (bar) => +bar) // Infered arg type is (bar: string) => Awaitable<number>

handle // RPCHandle<Descriptor>
  .call('foo', '123') // Infered type is call('foo', bar: string) => Promise<number>
  .then(r => r === 123) // true
```

---

# Introduction
[@chijs/rpc](https://github.com/thezzisu/chi/tree/development/packages/rpc)

However, use `handle.call` is not so geek

We provided a way to wrap a RPCHandle into a object with properties mapped to corresponding calls using Proxy

eg.
```ts
handle.call('foo', '123')
// equals to
const proxy = createRpcWrapper(handle, '')
proxy.foo('123')
```

See `src/wrapper.ts` for implementation

---

# Introduction
[@chijs/rpc](https://github.com/thezzisu/chi/tree/development/packages/rpc)

In fact, like `@vue/reactivity`, this package is also useful outside ChiJS

A untyped version is already used in some of my earlier projects


---

# Introduction
[@chijs/app](https://github.com/thezzisu/chi/tree/development/packages/app)

This packages is the core of whole project, providing a ChiServer class to start a ChiJS server, and a set of utilities to define a ChiJS plugin

The server part will be explained in next section (Architecture). Let's dive into the plugin part first

A Chijs Plugin have two import concepts: **Action** and **Unit**

---

# Introduction
[@chijs/app](https://github.com/thezzisu/chi/tree/development/packages/app)

A **Action** defines a function that'll get called during a **Task**. During a Action execuation, Chi Server will create a **Job** inside the **Task**,  fork a Node.JS process associated with that **Job** and **Task**, then execuate the action

**Action**s are designed to be composable, eg. a action could easily invoke other actions like calling a remote method. All actions invoked during a **Task** is recorded as corresponding **Job**s

ChiJS Plugins will **never** get execuated in ChiJS server process; instead, we provides special actions prefixed with `#` to be automatically trigged on specific server events (currently only `#onload` is implemented)

This design ensures all actions are side-effect free to ChiJS server

---

# Introduction
[@chijs/app](https://github.com/thezzisu/chi/tree/development/packages/app)

A **Unit** defines a function that'll get called when starting a **Service**

Different from **Action**, a **Unit** do not have result, and the execuation process will remain running after the unit function return

A **Unit** have a RPCTypeDescriptor associated, which made communications between services easy

In practice, it's recommended to create services using actions - for example, a plugin could create serviced when being loaded using `#onload` action

However, service can also be managed via UI

---

# Introduction
[@chijs/app](https://github.com/thezzisu/chi/tree/development/packages/app)

Example Chijs plugin

<div class="absolute inset-4 flex">
  <div class="wrapper flex-1 relative pt-36 px-8">

```ts {monaco}
// @ts-nocheck
// Since we cannot provide type info in browser, just turn off type checker
import { definePlugin, PluginDescriptorOf } from '@chijs/app'
import { RpcTypeDescriptor } from '@chijs/rpc'
import { Type } from '@chijs/util'

type FooURD = RpcTypeDescriptor<
  {
    foo(bar: string): Promise<number>
    bar(a: string, b: string): Promise<string>
  },
  {}
>

const plugin = definePlugin((b) =>
  b
    .params(
      Type.Object({
        foo: Type.String(),
        wait: Type.String()
      })
    )
    .action('#onload', (b) =>
      b.build(async (ctx) => {
        const service = await ctx
          .plugin('~/foo.ts')
          .unit('foo')
          .create('plugin-foo-1', { wait: '123' })
        await ctx.api.service.start(service.id)
        ctx.logger.info('plugin-foo-1 started')
      })
    )
    .action('sumer', (b) =>
      b
        .name('sumer')
        .params(Type.Object({ nums: Type.Array(Type.Number()) }))
        .result(Type.Number())
        .build(async (ctx, params) => params.nums.reduce((a, b) => a + b))
    )
    .action('quiz', (b) =>
      b
        .name('Simple Quiz')
        .description('# A simple quiz')
        .result(Type.Boolean())
        .build(async (ctx) => {
          const a = await ctx.agent.prompt('input a number:')
          const b = parseInt(a, 10)
          if (isNaN(b)) {
            await ctx.agent.alert('invalid input')
            throw new Error('Fucked!')
          }
          const c = await ctx.agent.prompt('input another number:')
          const d = parseInt(c, 10)
          const result = await ctx
            .self()
            .action('sumer')
            .run({ nums: [1, 2, 3] })
          ctx.agent.notify(`result = ${result}`)
          return b === d
        })
    )
    .unit('foo', (b) =>
      b
        .attach<FooURD>()
        .params(Type.Object({ wait: Type.Optional(Type.String()) }))
        .build(async (ctx, params) => {
          ctx.endpoint.provide('foo', (bar) => +bar)
          ctx.endpoint.provide('bar', (a, b) => `${a} + ${b}!`)
          ctx.logger.info(params)
          ctx.logger.info(ctx.params)
        })
    )
    .build()
)

declare module '@chijs/app' {
  interface IPluginDescriptors {
    '~/foo.ts': PluginDescriptorOf<typeof plugin>
  }
}

export default plugin


//
```

  </div>
</div>
  
<style>
iframe {
  height: 100% !important;
}
</style>

---

# Introduction
[@chijs/app](https://github.com/thezzisu/chi/tree/development/packages/app)

Moreover, ChiJS plugins are **Fully Typed** with Descriptors

The implementation is like those in `@chijs/rpc`, and the basic ideas are the same

See `src/plugin/*.ts` for details


---

# Introduction
[@chijs/client](https://github.com/thezzisu/chi/tree/development/packages/client)

---

# Introduction
[@chijs/cli](https://github.com/thezzisu/chi/tree/development/packages/cli)

---

# Introduction
[@chijs/ui](https://github.com/thezzisu/chi/tree/development/packages/ui)


---

# Introduction
[@chijs/create-chi](https://github.com/thezzisu/chi/tree/development/packages/create-chi)


---
layout: section
---

# Architecture

---

# Architecture

- TODO: write arch

---
layout: section
---

# Getting Started

---

# Getting Started

- TODO: write getting started

---
layout: section
---

# Future

---

# Future
Functionality

- Custom view in UI: let plugin add pages into ui
  - could be implemented using `<iframe>`
- Stabilize API
- API for file mapping
- Development mode for auto HMR
- Plugin ecosystem
  - Plugin for KoishiJS, HTTP server, ...
  - Scheduler to dispatch actions at specific times/events
  - Sysinfo to act as server dashboard
- ...

---

# Future
Community

- Move the repository into a sperate organization
- **Docs**

---

# Future

<div class="h-full flex items-center justify-center pb-32">
  <div class="text-5xl">Your valuable advices are welcomed!</div>
</div>


---
layout: section
---

# Thanks

---

# Thanks

- We are honored to take this interesting and fulfilling course
- As a self-learned developer, it's mind-refreshing to systemically review the language I use everyday, and to correct some incomplete perceptions
- ...
- Upon the completion of this work, We am grateful to those who have offered us encouragement and support during the course of my study.
- Special acknowledgment must be given to our respectable teacher whose patient instruction and constructive homeworks are beneficial to us a lot.


---
layout: cover
background: /background.jpg
---

# EOF

Project members

张子苏 2100012732 [thezzisu](https://www.github.com/thezzisu)

<!--
还有一位
-->
