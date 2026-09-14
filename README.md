<div align="center">

# ⚡ Voltrix

### AI-Powered Full-Stack App Builder — Describe It. Watch It Build Itself.

*A Lovable.dev-inspired SaaS platform where natural language becomes working React applications, streamed live into an in-browser IDE.*

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-Build-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind-CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**[Backend Repo →](https://github.com/Shashank07-debug/Voltrix-)**

</div>

---

## What is this?

You type a sentence. Voltrix's AI agent reads your existing project, plans the change, and streams back real, working React files — live, token by token — into a code editor you can watch, inspect, and run in a sandboxed preview, all without leaving the browser.

This repo is the **frontend**: the chat interface, the IDE workspace, the collaboration layer, and everything the user actually touches. The AI reasoning and code generation happens in the [Spring Boot + Spring AI backend](https://github.com/Shashank07-debug/Voltrix-).

## ✨ Highlights

<table>
<tr>
<td width="50%" valign="top">

### 🤖 Live AI Code Generation
Chat-driven, streaming generation via Server-Sent Events. Files appear as the model writes them — not a spinner, then a dump. The agent is file-tree-aware, so edits stay consistent with what already exists in the project.

### 💻 A Real IDE, In the Browser
Type-coded file tree, tabbed multi-file editor with syntax highlighting, and a live sandbox preview that compiles and runs the generated app on demand.

</td>
<td width="50%" valign="top">

### 👥 Built for Teams
Invite collaborators with **Owner / Editor / Viewer** roles. Role state is visible everywhere — navbar badges, share modal, workspace controls — not hidden behind a click.

### 🎨 Theming That Actually Works
A sitewide dark/light toggle that reaches *every* surface — dashboard, workspace, modals, even the code editor gutter — not just the top half of the page.

</td>
</tr>
</table>

### 📱 Responsive Down to the Fold
Tested and tuned across desktop, tablet, mobile, and foldable/flip form factors — including the awkward near-square unfolded state most responsive builds ignore — with smooth, `prefers-reduced-motion`-aware transitions between breakpoints.

### 🔐 Auth & Project Management
JWT-based sign-in, a project dashboard with per-project role and stack metadata, and one-click launch into the workspace.

## 🛠 Tech Stack

| | |
|---|---|
| **Core** | React 18 · TypeScript (strict) · Vite |
| **Styling** | Tailwind CSS · shadcn-ui |
| **Streaming** | Server-Sent Events over `fetch` + `ReadableStream` (POST-based — not native `EventSource`) |
| **Backend** | Spring Boot 4 · Spring AI · PostgreSQL · MinIO — [see backend repo](https://github.com/Shashank07-debug/Voltrix-) |

## 🚀 Getting Started

### Prerequisites
- Node.js & npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- The [Voltrix backend](https://github.com/Shashank07-debug/Voltrix-) running locally (default: `http://localhost:8082`)

### Setup

```bash
# 1. Clone it
git clone https://github.com/Shashank07-debug/Voltrix-frontend.git
cd Voltrix-frontend

# 2. Install
npm install

# 3. Run
npm run dev
```

Runs at `http://localhost:5173`. The backend needs to be running for auth, streaming, and file operations to work.

## 📁 Structure

```
src/
├── components/      # Chat panel, file tree, editor, modals, cards
├── hooks/           # Theme, data fetching
├── pages/           # Projects Portal, Project Workspace, Auth
├── api.ts           # Backend client — auth, projects, streaming chat, members
├── types.ts         # Shared types
└── App.tsx
```

## 🧠 How It Actually Got Built

Scaffolded fast with AI-assisted generation, then hardened the slow way: screenshot the UI, find the specific thing that's wrong — a role badge rendering empty, a theme toggle that only painted half the screen, a chat call throwing `TypeError: api.streamChatMessage is not a function` — write a scoped fix prompt, verify, repeat. That included tracing a frontend/backend method-name mismatch back to its root cause instead of patching around it, and taking a "working" dark-mode-only app through four separate rounds of light-theme coverage until every surface actually matched.

The point isn't that AI wrote the code. It's the debugging discipline layered on top of it.

## 🗺 Roadmap

- [ ] Automated test coverage (Vitest is configured, not yet used)
- [ ] CI pipeline
- [ ] Live hosted demo

## 📄 License

MIT © [Shashank M N](https://github.com/Shashank07-debug)

See [LICENSE](LICENSE) for full text.

---

<div align="center">
<sub>Built by <a href="https://github.com/Shashank07-debug">Shashank M N</a></sub>
</div>
