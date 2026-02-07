# GinkoHub Technical Guide

This document provides in-depth technical details about the GinkoHub project's architecture, implementation, and guidelines for contributing and editing. It serves as a companion to the main `README.md`, `ARCHITECTURE.md`, and `CONTRIBUTING.md` files.

## 1. Project Overview

GinkoHub is a SvelteKit 5 application with a minimalist, "Cyber Flâneur" aesthetic. It functions as a developer portfolio and a digital playground, showcasing features like an auto-scanning modular system, a quote image generator, arcade games, and developer tools.

-   **Framework**: SvelteKit 5.0 (using Runes for reactivity)
-   **Styling**: Tailwind CSS 4.0
-   **Runtime**: Bun
-   **Deployment**: GitHub Actions & GitHub Pages
-   **License**: Mozilla Public License 2.0 (MPL-2.0)

## 2. Core Architecture: Auto-Scanning Modularity

The project's central design pattern is its **Auto-Scanning Component System**, which leverages Vite's `import.meta.glob` for dynamic, build-time component discovery. This enables a highly decoupled and extensible architecture.

### 2.1. Dynamic Tab Loading (`src/routes/+page.svelte`)

The main application layout (`src/routes/+page.svelte`) automatically discovers and registers top-level navigation tabs from the `src/lib/tabs/` directory.

-   **How it works**: At build time, `import.meta.glob('$lib/tabs/*.svelte', { eager: true })` imports all Svelte files within `src/lib/tabs/`.
-   **Adding a new Tab**: Create a new `.svelte` file (e.g., `src/lib/tabs/Gallery.svelte`). The system will automatically include it as a navigation item.
-   **Tab Ordering**: To control the sequence of tabs, modify the `order` object within the `<script>` block of `src/routes/+page.svelte`. Each tab name from `src/lib/tabs/` should have a corresponding numerical order.
    ```javascript
    // Example in src/routes/+page.svelte:
    const order = {
        about: 1,
        news: 2,
        game: 3,
        tools: 4,
        words: 5,
        // Add new tabs here, e.g.:
        // gallery: 6,
    };
    ```
-   **Props**: Each tab component receives global state as props: `data` (loaded server-side), `accentColor` (for theming), and `bgImage` (for background).

### 2.2. Feature Scanning (Tab-Specific)

Individual tabs can further utilize the auto-scanning pattern to load their own sub-features. The "Game" tab, for instance, scans `src/lib/features/game/` for new game components.

-   **How it works**: Similar to tab loading, a tab component might use `import.meta.glob('../features/<feature_name>/*.svelte', { eager: true })`.
-   **Adding a New Game**: Create a new `.svelte` file in `src/lib/features/game/` (e.g., `Pacman.svelte`). The `Game.svelte` tab component will discover and list it.
-   **Adding Features to Other Tabs**: Follow the pattern within the respective feature directories (e.g., `src/lib/features/about/`, `src/lib/features/tools/`). Components are often prefixed with numbers for ordering (e.g., `01-Quote.svelte`, `02-Connect.svelte`).

## 3. Svelte 5 Runes for Reactivity & State Management

The project uses Svelte 5's new reactivity system (Runes) for fine-grained state management.

-   **Global State**: Core application state (like `persona`, `currentAccent`, `scrapedQuotes`) is managed in `src/routes/+page.svelte`.
    -   `$state()`: Used for reactive state variables.
    -   `$derived()`: For values that depend on other state variables.
    -   `$props()`: Used in child components to receive state passed down from parents.
-   **State Passing**: State is passed down as props. To modify parent state from a child, you typically pass down functions that trigger state updates in the parent (e.g., `triggerAura`, `shufflePersona`).
-   **Example**: A component might receive `accentColor` as a prop and use it to set a CSS variable for Tailwind:
    ```svelte
    <script>
        let { accentColor } = $props();
    </script>
    <div style="--accent-color: {accentColor.hex};">
        <!-- Component content using CSS variable -->
        <h1 class="text-lg text-primary-content">My Section</h1>
    </div>
    ```

## 4. Data Pipeline & Handling

The project employs a build-time data generation strategy for static content.

### 4.1. Quote Scraping

-   **Source**: Goodreads (via direct HTML scraping).
-   **Script**: `scripts/scrape-quotes.js`
-   **Execution**: Can be run manually using `bun run scrape`. This script is also implicitly run during the build process.
-   **Output**: Generates `static/data/quotes.json`, containing an array of quote objects.
-   **Fallback**: If `quotes.json` is missing during a build or server startup, `src/routes/+page.server.js` provides a hardcoded fallback array.

### 4.2. Data Loading

-   **Server-Side Loading**: `src/routes/+page.server.js` reads the `static/data/quotes.json` file using Node.js's `fs` module at server-render or build time.
-   **Passing to Frontend**: The loaded data is exported as `data` from `+page.server.js`, which SvelteKit then makes available as the `data` prop to `src/routes/+page.svelte`.

## 5. Styling and Theming

-   **Tailwind CSS 4**: Provides a utility-first CSS framework. Styles are applied directly using class names.
-   **Dynamic Theming**:
    -   The main layout (`src/routes/+page.svelte`) defines CSS variables like `--accent-color` and `--bg-image` based on user selections or defaults.
    -   These variables are applied to the root element and can be referenced in Tailwind CSS utilities using the `theme()` function or via direct inline styles on elements.
    -   Example: `class="text-primary-content"` where `primary-content` might be defined using `--accent-color`.
-   **Animations**:
    -   **Svelte Transitions**: Used for smooth mounting/unmounting of components (e.g., `fade`, `fly`).
    -   **CSS Animations**: Keyframe animations are used for interactive effects like shaking or glowing.

## 6. Feature Implementation Details

### 6.1. Quote Generator (`src/lib/features/about/01-Quote.svelte`)

-   **Customization**: To add new themes or modify existing ones, inspect `01-Quote.svelte`. The generation logic and styling for different themes (Minimal, Impact, Poetic, Cyber, Glass) are implemented here.
-   **Backgrounds**: Background images are managed through CSS variables and can be changed by updating the relevant state in the parent component or by modifying the image selection logic within `01-Quote.svelte`.
-   **Typography**: Font loading is handled, and font families can be adjusted within the CSS or Tailwind configuration.

### 6.2. Arcade Games (`src/lib/features/game/`)

-   **Structure**: Each game should be a standalone Svelte component (e.g., `Snake.svelte`, `Evasion.svelte`).
-   **Integration**: The `Game.svelte` tab automatically lists and renders games found in this directory.
-   **Requirements**: Games should ideally be self-contained and accept minimal props, focusing on their own internal state management. They might receive general game-related props from the `Game.svelte` tab if needed for global settings.

### 6.3. Developer Tools (`src/lib/features/tools/`)

-   **Structure**: Similar to games, each tool (e.g., `JsonFormatter.svelte`, `Base64.svelte`) is a component within `src/lib/features/tools/`.
-   **Functionality**: Implement the tool's logic directly within the Svelte component.

### 6.4. Link Previewer (`src/lib/features/preview/`)

-   This feature includes multiple Svelte components for different social platforms and a state management file (`previewState.svelte.js`).
-   **Usage**: Components like `02-Twitter.svelte` likely handle fetching meta tags for a given URL and rendering a preview. `previewState.svelte.js` would manage the shared state for the preview input and result.
-   **Extending**: To add support for new platforms, create new Svelte components in this directory and potentially update the state management logic.

## 7. Development Workflow and Contributing

### 7.1. Prerequisites

-   [Bun](https://bun.sh/) installed.

### 7.2. Setup

1.  **Clone**: `git clone https://github.com/ginkohub/ginkohub.github.io.git`
2.  **Install Dependencies**: `bun install`

### 7.3. Running the Project

-   **Development Server**: `bun run dev` (Starts a hot-reloading dev server)
-   **Build for Production**: `bun run build` (Generates static site in the `build` directory)
-   **Scrape Data**: `bun run scrape` (Manually trigger quote scraping)

### 7.4. Code Style and Formatting

-   **Svelte**: Adhere to Svelte 5 Runes syntax (`$state`, `$derived`, `$props`).
-   **CSS**: Use Tailwind CSS 4.0 utility classes.
-   **Formatting**: Use `bun run format` to automatically format your code with Prettier. This command should be run before committing changes.

### 7.5. Contributing

-   Refer to `CONTRIBUTING.md` for detailed contribution guidelines, including how to propose changes and submit pull requests.
-   **Key Principle**: For adding new features or content, primarily focus on creating new files in the appropriate `src/lib/tabs/` or `src/lib/features/` subdirectories.
-   **Modifying Existing Code**: Locate the relevant Svelte component or script file in `src/`. Understand its role within the auto-scanning system and make changes directly, ensuring they align with the project's aesthetic and technical standards.

## 8. Configuration Files Explained

-   `package.json`: Project metadata, dependencies, and scripts (e.g., `dev`, `build`, `scrape`, `format`).
-   `svelte.config.js`: SvelteKit configuration, including adapter settings (e.g., static adapter for GitHub Pages).
-   `vite.config.js`: Vite build tool configuration, including Svelte plugin and other optimizations.
-   `.gitignore`: Specifies intentionally untracked files that Git should ignore.
-   `.npmrc` / `.bunrc`: npm/Bun configuration (if any specific settings are applied).
-   `.prettierrc` / `.prettierignore`: Prettier configuration for code formatting.
-   `jsconfig.json` / `tsconfig.json` (if applicable): JavaScript/TypeScript compiler options.
-   `.github/workflows/deploy.yml`: GitHub Actions workflow definition for continuous deployment.
