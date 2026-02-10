# GinkoHub Technical Guide

This document provides in-depth technical details about the GinkoHub project's architecture, implementation, and guidelines for contributing and editing. It serves as a companion to the main `README.md`, `ARCHITECTURE.md`, and `CONTRIBUTING.md` files.

## 1. Project Overview

GinkoHub is a SvelteKit 5 application with a minimalist, "Cyber Flâneur" aesthetic. It functions as a developer portfolio and a digital playground, showcasing features like an auto-scanning modular system, a quote image generator, arcade games, and developer tools.

- **Framework**: SvelteKit 5.0 (using Runes for reactivity)
- **Styling**: Tailwind CSS 4.0
- **Runtime**: Bun
- **Deployment**: GitHub Actions & GitHub Pages
- **License**: Mozilla Public License 2.0 (MPL-2.0)

## 2. Core Architecture: Auto-Scanning Modularity

The project's central design pattern is its **Auto-Scanning Component System**, which leverages Vite's `import.meta.glob` for dynamic, build-time component discovery. This enables a highly decoupled and extensible architecture.

### 2.1. Dynamic Tab Loading (`src/routes/+page.svelte`)

The main application layout (`src/routes/+page.svelte`) automatically discovers and registers top-level navigation tabs from the `src/lib/tabs/` directory.

- **How it works**: At build time, `import.meta.glob('$lib/tabs/*.svelte', { eager: true })` imports all Svelte files within `src/lib/tabs/`.
- **Tab Organization**: The navigation bar is split into two rows:
  1.  **Primary Content**: Main sections like About, News, AI, Humor.
  2.  **Utilities & Experiments**: Functional tools like Tools, Game, Preview, Words.
- **Tab Ordering**: To control the sequence of tabs, modify the `order` object within the `<script>` block of `src/routes/+page.svelte`.
  ```javascript
  const order = { about: 0, tools: 1, news: 2, ai: 3, humor: 4, words: 5, preview: 6, game: 7 };
  ```
- **Persistence**: The active tab is persisted in `localStorage` (`ginkohub_active_tab`), restoring the user's last session state automatically.

### 2.2. Feature Scanning (Tab-Specific)

Individual tabs can further utilize the auto-scanning pattern to load their own sub-features. The "Game" tab, for instance, scans `src/lib/features/game/` for new game components.

- **Adding a New Game**: Create a new `.svelte` file in `src/lib/features/game/` (e.g., `Pacman.svelte`). The `Game.svelte` tab component will discover and list it.
- **Adding Features to Other Tabs**: Follow the pattern within the respective feature directories (e.g., `src/lib/features/about/`, `src/lib/features/tools/`).

## 3. Svelte 5 Runes for Reactivity & State Management

The project uses Svelte 5's new reactivity system (Runes).

- **Global State**: Core state like `persona`, `currentAccent`, `scrapedQuotes` is managed in `src/routes/+page.svelte`.
  - `$state()`: Reactive state variables.
  - `$derived()`: Computed values.
  - `$props()`: Receiving state from parents.
  - `$bindable()`: Allowing two-way binding for state passed down to children (essential for features like `Humor` where child components update parent state).

## 4. AI Integration (Puter.js)

The project integrates **Puter.js** to provide free, unlimited AI chat capabilities.

- **Component**: `src/lib/components/ChatWidget.svelte`
- **Location**: A persistent, floating widget at the bottom-right of the screen.
- **Configuration**:
  - **Models**: Supports `gpt-4o`, `gpt-4`, and `claude-3-5-sonnet`.
  - **System Prompt**: Configurable via the settings (gear icon) in the chat header. The default prompt establishes the "GinkoHub AI" persona (humble, technical, concise, Indonesian slang).
  - **Persistence**: Chat history is session-based, but system prompt preferences are saved to `localStorage`.
- **Implementation**: Uses the global `window.puter.ai.chat()` method provided by the Puter SDK script loaded in `src/app.html`.

## 5. Visuals & "Cyber Flâneur" Aesthetic

- **Interactive Background**: A dot grid that reacts to mouse movement, creating a "spotlight" effect.
- **Data Motes**: Floating particles (`src/routes/+page.svelte`) that drift organically across the screen.
- **Scanline**: A CSS animation overlay simulating a CRT monitor scanline.
- **Glitch Effects**: Random text glitches on the main title.
- **UI Polish**: Extensive use of `rounded-xl`, `backdrop-blur`, and `border-slate-800` for a sleek, modern look.

## 6. Feature Implementation Details

### 6.1. Quote Generator (`src/lib/features/about/01-Quote.svelte`)

- **Canvas Generation**: Renders quotes to an HTML5 Canvas for download/sharing.
- **Customization**: Supports multiple themes (Minimal, Impact, Poetic, Cyber, Glass), fonts, and alignments.

### 6.2. Word Finder (`src/lib/features/words/WordFinder.svelte`)

- **Database**: Uses `IndexedDB` to cache dictionary files for fast offline searching.
- **Search**: Supports Prefix and Soundex (phonetic) matching.
- **Settings**: Persisted via `localStorage` (Language, Method, Format, Size).

### 6.3. RSS Reader (`src/lib/features/news/01-RssReader.svelte`)

- **Proxy**: Uses the centralized `ghpFetch` utility (`src/lib/fetcher.js`) to bypass CORS and parse RSS feeds via GHP Tools.
- **Stability**: GHP Tools is used for robust scraping and ensures consistent content delivery, avoiding common proxy-related network errors.
- **Custom Feeds**: Users can add their own RSS URLs, which are saved to `localStorage`.

## 7. Development Workflow

1.  **Install**: `bun install`
2.  **Dev Server**: `bun run dev`
3.  **Build**: `bun run build` (Static adapter)
4.  **Format**: `bun run format`

## 8. Configuration

- `package.json`: Dependencies and scripts.
- `svelte.config.js`: SvelteKit & Adapter Static settings.
- `vite.config.js`: Vite build configuration.
- `tailwind.config.js`: (Implicit in v4) managed via CSS imports.
