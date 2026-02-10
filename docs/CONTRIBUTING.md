# Contributing Guide

## How to Add New Content

Thanks to the **Auto-Scanning Architecture**, adding new features is primarily a file-system operation.

### 1. Adding a New Main Tab

To add a new section to the main navigation (e.g., "Gallery"):

1.  Create a file: `src/lib/tabs/Gallery.svelte`.
2.  Add your content. It will automatically receive the following props if defined:
    ```svelte
    <script>
    	let { data, accentColor, bgImage } = $props();
    </script>
    ```
3.  **Optional**: To control the tab order, update the `order` object in `src/routes/+page.svelte`:
    ```javascript
    const order = { ..., 'gallery': 5 };
    ```

### 2. Adding a New Game

To add a new game to the Arcade:

1.  Create a file: `src/lib/features/game/Pong.svelte`.
2.  The system will detect it and add it to the game selector list as `Pong.sys`.

### 3. Adding a New About Section Feature

The "About" tab is also modular. To add a new slide/card:

1.  Create a file in `src/lib/features/about/`.
2.  Prefix it with a number to control order, e.g., `05-Skills.svelte`.

## Development Workflow

1.  **Install**: `bun install`
2.  **Dev Server**: `bun run dev`
3.  **Scrape Data**: `bun run scrape` (Updates `static/data/quotes.json`)

## Code Style

- **Svelte**: Use Svelte 5 Runes syntax (`$state`, `$derived`, `$props`).
- **CSS**: Tailwind CSS 4.0 utility classes.
- **Formatting**: Run `bun run format` before committing.
