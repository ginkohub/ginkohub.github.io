# Architecture Documentation

## Overview

GinkoHub is a **Single Page Application (SPA)** built with **SvelteKit 5** (Static Adapter) and **Tailwind CSS 4**. It acts as a developer portfolio and playground, featuring a unique "Cyber Flâneur" aesthetic.

The core architectural principle is **Auto-Scanning Modularity**, allowing features to be added simply by creating files in specific directories without manual registration in a central config.

## Core Systems

### 1. Auto-Scanning Component System

The application relies heavily on Vite's `import.meta.glob` feature to dynamically import components at build time. This creates a highly decoupled architecture.

#### Level 1: Tabs (`src/routes/+page.svelte`)

The main layout scans the `src/lib/tabs/` directory:

```javascript
// src/routes/+page.svelte
const tabModules = import.meta.glob('$lib/tabs/*.svelte', { eager: true });
```

- **Discovery**: Any `.svelte` file in `src/lib/tabs/` automatically becomes a main navigation tab.
- **Ordering**: A hardcoded `order` object in `+page.svelte` determines tab sequence. New tabs default to the end.
- **State Passing**: The main page manages global state (Persona, Theme, Data) and passes it down to the active tab via props.

#### Level 2: Features (e.g., `src/lib/tabs/Game.svelte`)

Individual tabs can implement the same pattern to scan for their own sub-features. For example, the Game tab scans `src/lib/features/game/`:

```javascript
// src/lib/tabs/Game.svelte
const gameModules = import.meta.glob('../features/game/*.svelte', { eager: true });
```

This allows adding a new game (e.g., `Pacman.svelte`) just by dropping the file into the folder.

### 2. State Management (Svelte 5 Runes)

The project uses Svelte 5's fine-grained reactivity system (Runes).

- **Global State**: Managed in `src/routes/+page.svelte`.
  - `persona`: Changes the site title and "character".
  - `currentAccent`: Controls the primary color theme.
  - `scrapedQuotes`: Data loaded from JSON.
- **Props**: State is passed down to children.
  - **Note**: Since props in Svelte 5 are read-only by default, mutable state is often passed with `bind:` or as functions to modify the parent state (e.g., `triggerAura`, `shufflePersona`).

### 3. Data Pipeline

The project uses a **Hybrid Data Fetching** strategy.

1.  **Scraping (Build Time)**: `scripts/scrape-quotes.js` runs (via `bun run scrape`).
    - Fetches HTML from Goodreads.
    - Parses with Regex.
    - Writes to `static/data/quotes.json`.
2.  **Loading (Server Side)**: `src/routes/+page.server.js` reads the JSON file from the filesystem.
    - It uses `fs.readFileSync` to load the generated JSON.
    - Includes a hardcoded fallback if the file is missing.
    - Passes data to the frontend via the `data` prop.

### 4. Styling System

- **Tailwind CSS 4**: Used for utility-first styling.
- **Dynamic Themes**:
  - The `style="--accent-color: {currentAccent.hex}"` inline style on the root wrapper allows Tailwind utilities to use CSS variables for dynamic coloring.
- **Animations**:
  - Svelte Transitions (`fade`, `fly`) are used for mounting/unmounting components.
  - CSS Keyframes (`shake`, `glow-expand`) are used for interactive feedback.

## Directory Structure Logic

```text
src/
├── lib/
│   ├── index.js       # Shared utilities
│   ├── tabs/          # Level 1: Main Navigation Tabs
│   └── features/      # Level 2: Tab-specific features
│       ├── game/      # Arcade games
│       ├── about/     # About section sub-components
│       └── ...
├── routes/
│   └── +page.svelte   # Main Controller & Layout
└── static/
    └── data/          # Generated JSON data
```
