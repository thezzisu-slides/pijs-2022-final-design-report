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
The last comment block of each slide will be treated as slide notes. It will be visible and editable in Presenter Mode along with the slide. [Read more in the docs](https://sli.dev/guide/syntax.html#notes)
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

# 1. Background


---

# 1. Background
## 1.1 JavaScript ecosystem: the Plugin problem

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

# 1.1 The Plugin problem
## Module based plugins
- Q: How to share functions between plugins?
- To this question, some framworks has given their best practice
- Example: [KoishiJS Service](https://koishi.js.org/guide/plugin/service.html#%E6%9C%8D%E5%8A%A1%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)
- The core concept here is **D**ependency **I**njection or **I**nverse **o**f **C**ontrol
- Plugin inject custom property to (somehow) global objects, then other plugins could use them
- Typing is archived using TypeScript declartion merging


---

# 1.1 The Plugin problem
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

# 1.1 The Plugin problem

- However, there are other ways to implement plugins
- We could load plugins into separate processes and communicate with them using IPC
- Example: [VSCode extension host](https://code.visualstudio.com/api/advanced-topics/extension-host)
- In this slide, we call this implementation method `process based plugins`


---

# 1.1 The Plugin problem
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

# 1.1 The Plugin problem
- In ChiJS, we implemented a **process based** plugin system
- A low-overhead **RPC** mechanism is provided
- Typeing is archived using **global type injection** based on TypeScript declartion merging


---

# 1. Background
## 1.2 JavaScript ecosystem: the Type problem

-


---


---


---


---


---


---


---


---


---
