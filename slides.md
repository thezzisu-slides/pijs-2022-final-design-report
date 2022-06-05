---
theme: seriph
background: assets/background.jpg
class: "text-center"
# https://sli.dev/custom/highlighters.html
highlighter: shiki
lineNumbers: true
info: |
  ## PiJS Final Design Report
  & Prototype Design for [ChiJS Project](github.com/thezzisu/chi)

  Background Art credit: [大核斧子](https://www.pixiv.net/users/73955870)
drawings:
  persist: false
---

# PiJS Final Design Report

& Prototype Design for ChiJS Project

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

<style>
h1 {
  background-image: linear-gradient(45deg, #ff6d91 10%, #cc5774 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

---

# Background

### JavaScript ecosystem: the Plugin problem

- Lot's of JS framworks supports 'plugin' to make them extendable
- How to implement the plugin function?
  - Load plugin (JS module or function) into main program
  - Use events/hooks to inject specific code into execution flow and change origin behavior
  - Example:
    - Express, Fastify
    - Webpack, Vite
    - KoishiJS

---

# The Plugin problem

- Q: How to share functions between plugins?
- To this question, some framworks has given their best practice
- Example: [KoishiJS Service](https://koishi.js.org/guide/plugin/service.html#%E6%9C%8D%E5%8A%A1%E7%9A%84%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F)
- The core concept here is **D**ependency **I**njection or **I**nverse **o**f **C**ontrol
- Plugin inject custom property to (somehow) global objects, then other plugins could use them
- Typing is archived using TypeScript declartion merging
- However, there're still more problems:
  - 🤯 Plugin side-effects
  - 🤔 Same plugin, multiple instance
  - 😂 One crash, all crash
