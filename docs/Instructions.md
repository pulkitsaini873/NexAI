# PRD: Personal AI Assistant Web App

### TL;DR

A personal AI assistant web app that unifies chat, image generation, text-to-speech (standard and live streaming), and AI-refined web search — all powered exclusively by the best free-tier APIs. Users select from a dropdown of top models across Groq, Google AI Studio, OpenRouter, NVIDIA NIM, and Mistral, while image generation and TTS leverage NVIDIA NIM's free endpoints (magpie-tts-flow and Riva). Built for individual developers and power users who want a premium, multi-model AI experience without paying a cent in API costs.

---

## Goals

### Business Goals

1. **Zero infrastructure cost** — Build a fully functional AI assistant using only free-tier APIs, eliminating all recurring API spend in the MVP phase.
2. **Modular, extensible architecture** — Design the provider/model system so new APIs and models can be added to the dropdown with minimal code changes.
3. **Premium UX benchmark** — Achieve a sleek, polished interface on par with xAI's Grok — dark-first, fast, and distraction-free.
4. **Monetization foundation** — Establish a product base that can later support premium models, a hosted multi-user version, or a subscription tier.
5. **Ship MVP in 2–3 weeks** — Deliver a fully working, feature-complete product within a single development sprint cycle.

### User Goals

1. **Chat with multiple top AI models** without paying for any API — switch between Llama 4, Gemini 2.5 Flash, DeepSeek R1, Nemotron, and Mistral Large from one dropdown.
2. **Generate images from text prompts** using NVIDIA NIM free text-to-image endpoints — no Midjourney or DALL·E subscription required.
3. **Convert any AI response to speech** via standard TTS (NVIDIA magpie-tts-flow) or live streaming TTS (NVIDIA Riva) that reads responses word by word as they generate.
4. **Search the web and get AI-refined answers** — DuckDuckGo results are fetched in the background, passed to the selected model, and returned as a clean, cited summary.
5. **Switch models instantly** from a grouped dropdown without leaving the conversation or losing history.

### Non-Goals

1. **No user authentication or account system** in the MVP — the app is entirely client-side with no login flow.
2. **No paid API integration** in the MVP — only free-tier endpoints are supported.
3. **No mobile app** — this is a web-only product. Responsive layout is a nice-to-have but not a primary target.

---

## User Stories

### Persona 1 — Power User / Developer

- As a **power user**, I want to select from a dropdown of free models (Groq Llama 4 Scout, Gemini 2.5 Flash, DeepSeek R1, NVIDIA Nemotron, Mistral Large), so that I can **compare outputs across providers without switching tools or tabs**.
- As a **developer**, I want to ask the assistant to search the web and get a clean, AI-refined summary with source citations instead of raw links, so that I can **research technical topics faster**.
- As a **developer**, I want to generate images from a text prompt using NVIDIA NIM free image models, so that I can **prototype visuals and mockups without a paid Midjourney subscription**.
- As a **developer**, I want to set a custom system prompt, so that I can **tailor the assistant's behavior for specific tasks like code review or documentation**.
- As a **power user**, I want to switch models mid-conversation and have my chat history preserved, so that I can **test how different models handle the same context**.

### Persona 2 — Casual AI User

- As a **casual user**, I want to hear the AI's response read aloud via TTS, so that I can **consume content hands-free while multitasking**.
- As a **casual user**, I want real-time streaming speech (Live TTS) as the AI responds word by word, so that the experience **feels natural and immediate — like talking to a person**.
- As a **casual user**, I want to switch between chat, image, and voice modes from a clean sidebar, so that I **don't feel overwhelmed by the interface**.
- As a **casual user**, I want the app to remember my preferred model and TTS voice, so that I **don't have to reconfigure settings every time I visit**.

---

## Functional Requirements

- **Chat Module** (Priority: **P0**)
  - **Model Selector Dropdown:** Displays all available free-tier models grouped by provider — Groq (Llama 3.3 70B, Llama 4 Scout, Qwen3), Google AI Studio (Gemini 2.5 Flash, Gemini 2.5 Pro), OpenRouter (DeepSeek R1, Llama 4, Qwen3), NVIDIA NIM (Nemotron, Qwen3.5, Mistral), Mistral AI (Mistral Large, Codestral). User can switch mid-conversation.
  - **Streaming Chat Responses:** AI responses stream token by token in real time with a blinking cursor animation.
  - **Chat History:** Conversation history stored in browser `localStorage` per session. New session clears history or user can manually clear.
  - **System Prompt Support:** User can set and save a custom system prompt from the Settings tab. The system prompt is prepended to every request.

- **Web Search Module** (Priority: **P0**)
  - **Background DuckDuckGo Search:** When the user enables the web search toggle, the user's query is sent to DuckDuckGo in the background (via a Cloudflare Worker proxy if CORS blocks direct access).
  - **AI Refinement Pipeline:** Raw DuckDuckGo results (titles, snippets, URLs) are injected as context into the selected AI model's prompt. The model synthesizes a clean, cited response.
  - **Source Attribution:** The response includes collapsible source links (title + URL) from DuckDuckGo results, expandable on click.
  - **Search Toggle:** A toggle button in the input bar enables/disables web search on a per-message basis.

- **Image Generation Module** (Priority: **P1**)
  - **NVIDIA NIM Image Models:** Uses NVIDIA NIM free text-to-image endpoints from build.nvidia.com. A model selector shows available NVIDIA image models.
  - **Prompt Input:** Dedicated image tab in the sidebar with a text prompt field and aspect ratio selector (1:1, 16:9, 9:16).
  - **Image Display & Download:** Generated image displayed inline in a full-bleed preview panel with a download button.
  - **Prompt History:** Last 10 image prompts stored in `localStorage` for quick re-use.

- **TTS Module** (Priority: **P1**)
  - **Standard TTS:** Any AI text response can be played as audio using the NVIDIA magpie-tts-flow API. A speaker/play icon appears next to each response bubble.
  - **Live Streaming TTS (Real-Time):** When Live TTS mode is enabled in settings, speech is synthesized and streamed via NVIDIA Riva as the AI generates tokens — word by word, near real-time audio output.
  - **Voice Selection:** Dropdown in settings for available NVIDIA TTS voices.
  - **Stop/Pause Controls:** User can stop or pause audio playback mid-sentence via controls on the response bubble.

---

## User Experience

**Entry Point & First-Time User Experience**

- User navigates to the web app URL — **no login or signup required**.
- On first launch, an **API key input modal** appears, prompting the user to enter keys for each provider they want to use (Groq, Google AI Studio, OpenRouter, NVIDIA NIM, Mistral). Keys are stored in `localStorage` and never sent to any server.
- A brief **one-time tooltip tour** (dismissible) highlights: the model selector dropdown, the web search toggle, the image tab in the sidebar, and the TTS speaker icon.
- The app **remembers preferences** (selected model, TTS voice, dark/light mode) in `localStorage` across sessions.

**Core Experience**

- **Step 1: Chat**
  - User types a message in the **input bar pinned to the bottom** of the screen.
  - The **model selector dropdown** in the top bar shows models grouped by provider (Groq → Google → OpenRouter → NVIDIA NIM → Mistral). User selects their preferred model.
  - On send, the response **streams token by token** with a blinking cursor animation.
  - A **speaker icon** appears next to the completed response to trigger TTS playback.
  - Markdown content in responses is **rendered with syntax highlighting** for code blocks.

- **Step 2: Web Search**
  - User toggles the **"Web Search" button** in the input bar (icon + label).
  - On submit, a subtle **two-phase loading indicator** appears: _"Searching the web..."_ → _"Refining with AI..."_
  - The response appears with **inline source citations** — small numbered references that expand on click to show the source title and URL.
  - If DuckDuckGo returns no results, the AI responds from its own knowledge and appends a note: _"No web results found — responding from training data."_

- **Step 3: Image Generation**
  - User clicks the **"Image" tab** in the sidebar to switch to image mode.
  - The image panel shows: a **text prompt input**, an **aspect ratio selector** (1:1, 16:9, 9:16), and an **NVIDIA NIM image model selector**.
  - User clicks **"Generate"**. A loading spinner appears.
  - The generated image appears in a **full-bleed preview panel** with a **download icon** in the corner.
  - Previous prompts are accessible via a **prompt history dropdown** (last 10).

- **Step 4: TTS Playback**
  - User clicks the **speaker icon** next to any chat response. Audio plays via NVIDIA magpie-tts-flow.
  - For **Live TTS**, the user enables the **"Live Voice" toggle** in Settings. All subsequent AI responses stream as audio in real time as tokens generate — word by word.
  - **Stop and pause buttons** appear on the response bubble during playback.
  - A **voice selector dropdown** in Settings lets the user choose from available NVIDIA TTS voices.

- **Step 5: Model Switching**
  - User opens the **model dropdown** in the top bar mid-conversation and selects a different model.
  - The next message uses the **new model**. Conversation history is **preserved** — previous messages remain visible.
  - A subtle **label** on each response bubble indicates which model generated it.

**Advanced Features & Edge Cases**

- If a free API hits its rate limit, the app displays a **toast notification**: _"Model rate limit reached — try switching to a different model."_
- If NVIDIA TTS fails (endpoint down or rate-limited), the app **falls back to the browser's native Web Speech API** and shows an info toast.
- Long responses are **collapsed with a "Show more" toggle** after a configurable character threshold.
- If the user has not entered an API key for a selected provider, the model selector **grays out those models** with a tooltip: _"Add your API key in Settings to use this model."_

**UI/UX Highlights**

- **Dark mode by default** with a light mode toggle in the top bar.
- **Sidebar navigation:** Chat, Image, Settings tabs — clean icons with labels.
- **Top bar:** App name/logo (left), model selector dropdown (center), web search toggle + dark mode toggle (right).
- **Input bar (bottom):** Text input field, send button, web search toggle icon, TTS mode toggle icon.
- **Markdown rendering** with full syntax highlighting for code (supporting major languages).
- **Smooth streaming animation** — blinking cursor during generation, fade-in for completed tokens.
- **Responsive layout** — usable on tablet-width screens, but desktop is the primary target.
- **High contrast** ratios for accessibility in both dark and light modes.

---

## Narrative

Pulkit is a developer who's tired of hitting paywalls every time he wants to experiment with a different AI model. Right now, he has Gemini open in one tab, Groq in another, and OpenRouter in a third — constantly copy-pasting prompts between them to compare outputs. He wants to generate a quick product mockup image, but Midjourney costs $10/month. He wants voice output for hands-free coding sessions, but every TTS API demands a credit card before he can even test it.

One evening, Pulkit opens his **Personal AI Assistant** — a single, sleek web app he built himself. He picks **Llama 4 Scout** from the model dropdown, types a research question about WebSocket optimization, and toggles **Web Search** on. The app quietly pings DuckDuckGo in the background, pulls the top results, feeds them to Llama 4, and returns a clean, cited answer in under five seconds. He switches to **Gemini 2.5 Flash** for a follow-up coding question — same interface, no new tab, conversation history intact.

Next, he flips to the **Image tab**, types a prompt for a dashboard UI concept, and hits Generate. NVIDIA NIM returns a crisp mockup in seconds. He enables **Live TTS**, and as his next chat response streams in, the assistant reads it back word by word — natural, immediate, no lag.

Everything free. Everything in one place. Pulkit now has a tool that proves premium AI experiences don't require premium budgets — and a foundation he can share with other developers, grow into a community project, and eventually monetize.

---

## Success Metrics

### User-Centric Metrics

1. **Average session length > 10 minutes** — measured via `session_duration` event; indicates meaningful engagement beyond a single query.
2. **Model switching rate > 30% of sessions** — measured by `model_selected` events per session; validates the multi-model dropdown value proposition.
3. **Web search usage rate > 40% of messages** — measured by `web_search_toggled` events; validates the DuckDuckGo → AI refinement pipeline.
4. **TTS activation rate > 20% of sessions** — measured by `tts_played` events; validates voice output demand.

### Business Metrics

1. **Zero API cost** throughout the MVP phase — all endpoints remain within free-tier limits.
2. **First contentful paint < 2 seconds** — static hosting performance benchmark.
3. **Image generation success rate > 90%** — measures NVIDIA NIM free endpoint reliability and uptime.

### Technical Metrics

1. **Chat response first-token latency < 800ms** — targeting Groq's inference speed as the benchmark.
2. **Web search pipeline (DuckDuckGo fetch + AI refinement) completes in < 5 seconds** end to end.
3. **Live TTS audio lag < 500ms behind text stream** — critical for natural-feeling real-time speech.
4. **99% uptime on frontend** — achievable via static hosting on Vercel or Netlify.

### Tracking Plan

- `model_selected` — provider, model_name, timestamp
- `message_sent` — mode (chat / image / search), model_used, prompt_length
- `web_search_toggled` — enabled/disabled, per message
- `image_generated` — prompt_length, model_used, aspect_ratio, success/failure
- `tts_played` — type (standard / live), voice_selected, duration
- `rate_limit_hit` — provider, model_name, timestamp
- `session_duration` — start time, end time, total active time
- `api_key_configured` — provider (tracks onboarding completion)

---

## Technical Considerations

### Technical Needs

Technical Needs

- Frontend-only web app built with React (or vanilla JS) — no backend server required for MVP.
- All API calls are made directly from the browser using user-provided API keys stored in localStorage.
- API key input modal on first launch for each provider: Groq, Google AI Studio, OpenRouter, NVIDIA NIM, Mistral.
- Streaming responses implemented via Server-Sent Events (SSE) or fetch with ReadableStream, depending on provider API format.
- Markdown rendering library with code syntax highlighting (e.g., marked + highlight.js).
- Stack: React + Vite — recommended for AI-assisted IDE development. Fast setup, clean component structure, and excellent compatibility with Antigravity's code generation. Use Vite's dev server for rapid local iteration.

### Integration Points

| Provider                          | Endpoint Type                    | Use Case                                                                |
| --------------------------------- | -------------------------------- | ----------------------------------------------------------------------- |
| Groq API                          | OpenAI-compatible                | Chat (Llama 3.3 70B, Llama 4 Scout, Qwen3)                              |
| Google AI Studio API              | Gemini REST                      | Chat (Gemini 2.5 Flash, Gemini 2.5 Pro)                                 |
| OpenRouter API                    | OpenAI-compatible                | Chat (DeepSeek R1, Llama 4, Qwen3)                                      |
| NVIDIA NIM API (build.nvidia.com) | REST                             | Chat (Nemotron, Qwen3.5), Image Generation, TTS (magpie-tts-flow, Riva) |
| Mistral AI API                    | REST                             | Chat (Mistral Large, Codestral)                                         |
| DuckDuckGo                        | HTML scrape / Instant Answer API | Web search (no API key required)                                        |

### Data Storage & Privacy

- **All data stored in browser** `localStorage` — no server, no database, no cloud storage.
- API keys are stored locally and **never transmitted to any server other than the respective API provider**.
- **No telemetry or analytics** in MVP. All tracking events are local-only or opt-in for future iterations.
- Users **fully own their data** — clearing browser storage deletes everything.

### Scalability & Performance

- Static frontend hosted on **Vercel or Netlify free tier** — global CDN, no backend to scale.
- **Rate limit handling** per provider is baked into the frontend: exponential backoff, graceful fallback UI, and toast notifications when limits are hit.
- `localStorage` is sufficient for MVP; future iterations could optionally use IndexedDB for larger conversation histories.

### Potential Challenges

1. **CORS restrictions on DuckDuckGo** — direct browser requests will likely be blocked. Solution: a lightweight **Cloudflare Worker** (free tier, 100K requests/day) to proxy search requests.
2. **NVIDIA NIM free-tier rate limits** on TTS and image endpoints — need retry logic with exponential backoff and clear user-facing error states with fallback suggestions.
3. **Live TTS audio synchronization** — streaming audio in sync with token generation requires careful **audio buffer management** (Web Audio API + chunked audio decoding) to avoid choppy or delayed playback.
4. **Provider API format differences** — Groq and OpenRouter use OpenAI-compatible formats, but Google AI Studio and NVIDIA NIM have distinct request/response schemas. An **adapter layer** per provider will keep the codebase clean.

---

## Milestones & Sequencing

Project Estimate

Small — 1–1.5 weeks for a solo developer moving fast. Timeline compressed due to AI-assisted development using Antigravity IDE (Cursor-like), which handles boilerplate, API integrations, and component scaffolding automatically.

Team Size & Composition

1 person — you + Antigravity IDE. The AI-assisted IDE handles code generation, API integration scaffolding, and boilerplate, making this a realistic solo build in under 2 weeks.

development using Antigravity IDE (Cursor-like), which handles boilerplate, API integrations, and component scaffolding automatically.

Small — 1–1.5 weeks for a solo developer moving fast. Timeline compressed due to AI-assisted development using Antigravity IDE (Cursor-like), which handles boilerplate, API integrations, and component scaffolding automatically.

1 person — you + Antigravity IDE. The AI-assisted IDE handles code generation, API integration scaffolding, and boilerplate, making this a realistic solo build in under 2 weeks.

- **1 full-stack developer** (frontend-heavy) — builds the entire app, integrates all APIs, handles the Cloudflare Worker proxy.
- **1 product/designer (Pulkit)** — owns the design vision, defines UX details, tests and iterates. Can be the same person as the developer.

This is a solo-buildable project.

### Suggested Phases

Phase 1 — Core Chat + Model Selector (Days 1-3)

- Key Deliverables:Developer: Chat UI with input bar, response panel, and markdown rendering with syntax highlighting.Developer: API key input modal and localStorage key management.Developer: Model selector dropdown grouped by provider (Groq, Google AI Studio, OpenRouter, NVIDIA NIM, Mistral).Developer: Streaming chat responses (SSE / ReadableStream) for all five providers.Developer: Adapter layer to normalize request/response formats across providers.Developer: localStorage-based chat history and preference persistence.Developer: System prompt configuration in Settings tab.Dependencies: Free-tier API keys for all providers. Verify current rate limits and model availability.

Phase 2 — Web Search Pipeline + Image Generation (Days 4-6)

- Key Deliverables:Developer: Cloudflare Worker proxy for DuckDuckGo search requests (CORS workaround).Developer: DuckDuckGo → AI refinement pipeline — fetch results, inject as context, return cited response.Developer: Source attribution UI — collapsible citation links with title + URL.Developer: Web search toggle in input bar (per-message enable/disable).Developer: Image generation tab — prompt input, aspect ratio selector (1:1, 16:9, 9:16), NVIDIA NIM image model selector.Developer: Image display panel with download button and prompt history (last 10).

Dependencies: Cloudflare Worker account (free tier). Confirmed NVIDIA NIM image endpoint availability.

**Phase 3 — TTS + Live TTS + Polish (Week 3)**

Phase 3 — TTS + Live TTS + Polish (Days 7-10)

- Key Deliverables:Developer: Standard TTS integration via NVIDIA magpie-tts-flow — speaker icon on each response, audio playback controls.Developer: Live streaming TTS via NVIDIA Riva — real-time audio synthesis synchronized with token streaming using Web Audio API buffer management.Developer: Voice selector dropdown and stop/pause controls.Developer: Browser Web Speech API fallback when NVIDIA TTS is unavailable.Developer/Designer: Final UI polish — dark mode default, light mode toggle, smooth streaming animations, responsive layout, tooltip onboarding tour.Developer: Rate limit handling, error toasts, and edge case coverage across all modules.

Dependencies: NVIDIA Riva streaming endpoint access confirmed. Audio buffer sync testing across browsers (Chrome, Firefox, Edge).

- ## eveloper Notes — Building with Antigravity

  These are prompting strategies to get the best output from your AI IDE when building this app.
  - **API Integration Prompts:** When prompting Antigravity to integrate a new provider, always specify: the provider name, the exact base URL, whether it uses OpenAI-compatible format, and the streaming method (SSE vs ReadableStream). Example: "Integrate Groq API using OpenAI-compatible format at https://api.groq.com/openai/v1. Use fetch with ReadableStream for streaming. Store the API key from localStorage key 'groq_api_key'."
  - **Adapter Layer Prompt:** Ask Antigravity to generate a provider adapter pattern upfront: "Create a providerAdapter.js file that normalizes chat requests and streaming responses across Groq, Google AI Studio, OpenRouter, NVIDIA NIM, and Mistral into a single interface. Each provider should have its own adapter function."
  - **DuckDuckGo Pipeline Prompt:** "Write a Cloudflare Worker that accepts a search query, fetches DuckDuckGo HTML results, parses the top 5 result titles, snippets, and URLs, and returns them as JSON. Handle CORS headers for browser requests."
  - **Live TTS Prompt:** "Implement live streaming TTS using Web Audio API. As text tokens stream in, send each sentence chunk to NVIDIA Riva TTS endpoint, receive audio bytes, decode with AudioContext, and queue for gapless playback using AudioBufferSourceNode."
  - **Component Structure:** Ask Antigravity to scaffold the full component tree first before writing any logic: "Scaffold a React + Vite project with the following component structure: App, Sidebar (ChatTab, ImageTab, SettingsTab), TopBar (ModelSelector, SearchToggle), ChatPanel (MessageList, MessageBubble, InputBar), ImagePanel (PromptInput, AspectRatioSelector, ImagePreview)."
