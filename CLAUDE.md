# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Frontend for a **Spring AI RAG** (Retrieval-Augmented Generation) application — a knowledge-base Q&A system backed by Spring Boot + PostgreSQL/pgvector + OpenAI. Built with Vue 3, Vite, and Element Plus.

## Commands

```bash
npm install              # Install dependencies
npm run dev              # Start dev server on port 3000
npm run build            # Production build
npm run preview          # Preview production build
```

Dev server proxies `/api/*` → `http://localhost:8080` (the Spring Boot backend). The backend must be running for API calls to work.

## Architecture

```
src/
├── main.js              # App entry: registers Element Plus (zh-cn locale) + all icons globally
├── App.vue              # Root — just <router-view />
├── router/index.js      # All routes + navigation guard
├── api/index.js         # Axios instance (baseURL: /api/rag) + 7 API functions
└── views/
    ├── Login.vue        # Login page with Three.js particle background + 3 auth modes
    ├── Layout.vue       # Shell: dark sidebar (el-menu) + header with logout + <router-view />
    ├── RagChat.vue      # RAG Q&A: question input + topK slider + answer display
    ├── DirectChat.vue   # Direct LLM chat (no RAG retrieval)
    ├── DocumentManage.vue  # CRUD table for knowledge base documents
    └── SearchPage.vue   # Vector similarity search by text query
```

### Authentication flow

- **Login guard** (`router/index.js`): checks `sessionStorage.getItem('loggedIn')`. Unauthenticated users redirect to `/login`. Already-logged-in users skip login.
- **Logout** (`Layout.vue`): removes `'loggedIn'` from sessionStorage, redirects to `/login`.
- All login modes (phone, QR, password) are **demo/stub** — they set `sessionStorage` and navigate to `/rag-chat` without a real backend call.

### API layer (`src/api/index.js`)

Axios instance at `/api/rag` with a response interceptor that unwraps `response.data` and shows `ElMessage.error` on failure. Seven exported functions map to backend endpoints:

| Function | Method | Endpoint |
|---|---|---|
| `ragAnswer(question, topK)` | POST | `/answer` |
| `ragChat(message)` | POST | `/chat` |
| `saveDocument({title, content})` | POST | `/document` |
| `getDocuments()` | GET | `/documents` |
| `getDocumentById(id)` | GET | `/document/{id}` |
| `deleteDocument(id)` | DELETE | `/document/{id}` |
| `searchSimilar(query, topK)` | GET | `/search` |

### Login page (`Login.vue`)

The most complex component. Key implementation details:

- **Three.js particle sphere**: ~3500 particles (sphere shell + random interior) with additive blending, vertex colors biased toward cyan `#00f3ff` / pink `#ff3b7f` / gold. A central glow sprite pulses via `Math.sin`. Initialized in `onMounted`, disposed in `onBeforeUnmount`.
- **Three tab panels** (`phone`, `qrcode`, `password`) with `<Transition name="panel-fade">` for fade-in/out switching. Tab indicator uses a computed `left`/`width` style for smooth sliding.
- **Canvas captcha** (`CaptchaCanvas` inline component via `defineComponent` + render function `h()`): 5 random alphanumeric chars drawn on `<canvas>` with grid lines, random noise dots, 3 Bézier interference curves, rotated/scaled glyphs with alternating cyan/pink glow. Stores plaintext code; input is case-insensitive compared. On wrong input, auto-refreshes after 800ms.
- **QR code panel**: Canvas-drawn simulated QR with finder patterns + random data modules. WeChat/Alipay "login" buttons are stubs that `ElMessage.success()` and set sessionStorage.
- **Visual effects**: 5 radial-gradient glow orbs at corners + center, 2 expanding pulse-wave rings, animated gradient border on card wrapper, neon text-shadows, flowing shine on login button, card hover scale/shadow enhancement.

### Dependencies

- **Vue 3.4** + **vue-router 4.3** (Composition API with `<script setup>` throughout)
- **Element Plus 2.5** (el-container, el-menu, el-table, el-form, el-dialog, el-message, etc.)
- **@element-plus/icons-vue** (all icons registered globally in main.js)
- **Axios 1.6** (HTTP client with interceptor)
- **Three.js** (only used in Login.vue for particle background)

### Styling conventions

- Global reset and body font in `src/style.css`
- All component styles use `<style scoped>`
- Login page relies heavily on CSS custom animations (`@keyframes`), `backdrop-filter: blur()`, `text-shadow`/`box-shadow` for neon glow effects, and CSS transitions on hover/focus
- Responsive breakpoint at `max-width: 480px` on Login.vue
