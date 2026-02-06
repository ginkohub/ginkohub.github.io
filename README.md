# GinkoHub • Cyber Flâneur

> A minimalist, sharp-edged developer portfolio and digital playground.

[![Deploy to GitHub Pages](https://github.com/ginkohub/ginkohub.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/ginkohub/ginkohub.github.io/actions/workflows/deploy.yml)

GinkoHub is a modern, performance-optimized developer portfolio built with **SvelteKit 5** and **Tailwind CSS 4.0**. It follows a "Cyber Flâneur" aesthetic—minimalist, pure black dark theme, and immersive nature backgrounds—blending tech-focused experiments with poetic wisdom.

## 🚀 Live Demo
Visit the live site: [https://ginkohub.github.io/](https://ginkohub.github.io/)

---

## ✨ Key Features

### 🧩 Fully Modular Architecture
The project uses an advanced **Auto-Scanning Component System**. Adding new content is as simple as dropping a `.svelte` file into the right folder:
- **Modular Tabs**: Automatically builds navigation from `src/lib/tabs/`.
- **Feature Sections**: Each tab automatically scans its own `src/lib/features/<tab_name>/` directory.
- **Arcade Hub**: Games are automatically detected and added to the "Game" tab from `src/lib/features/game/`.

### 🖋️ Advanced Quote Image Generator
A professional-grade tool to generate and share wisdom:
- **Multiple Styles**: Choose from Minimal, Impact, Poetic, Cyber, or Glass themes.
- **Typography Engine**: Integrated font loading for Inter, Space Grotesk, Serif, and Monospace.
- **Creative Controls**: Real-time X/Y text positioning, font size scaling, and background brightness sliders.
- **Custom Backgrounds**: Use the site's nature images or upload your own.
- **Mobile Friendly**: Integrated **Web Share API** for one-tap sharing to social apps.

### 🎮 Retro Arcade Hub
A collection of sharp, minimalist digital experiments:
- **Snake.exe**: Classic survival.
- **Evasion.sys**: High-speed obstacle dodging.
- **Tetris.sys**: Modular block stacking.

### 🛠️ Developer Tools
- **Word Finder**: High-performance dictionary search (English/Indonesian) with Soundex and prefix matching.
- **Link Previewer**: Real-time social metadata visualization for any URL (X, Facebook, Discord, WhatsApp, LinkedIn).
- **Automated Scraping**: Build-time scraper that gathers fresh Rumi quotes from Goodreads without manual updates.

---

## 🛠️ Tech Stack

- **Framework**: [SvelteKit 5.0](https://svelte.dev/) (Runes-based reactivity)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Runtime**: [Bun](https://bun.sh/)
- **Deployment**: GitHub Actions & GitHub Pages
- **Data**: Build-time Node.js Scraper

---

## 💻 Getting Started

### Prerequisites
- [Bun](https://bun.sh/) installed on your machine.

### Installation
```bash
# Clone the repository
git clone https://github.com/ginkohub/ginkohub.github.io.git

# Install dependencies
bun install
```

### Development
```bash
# Start dev server
bun run dev

# Manually trigger quote scraper
bun run scrape
```

### Build
```bash
# Build for production (static generation)
bun run build
```

---

## 📂 Project Structure

```text
src/
├── lib/
│   ├── features/      # Modular tab features (scanned automatically)
│   │   ├── about/     # Quotes, Connections, etc.
│   │   ├── game/      # Arcade components
│   │   └── ...
│   └── tabs/          # Main navigation tabs (scanned automatically)
├── routes/            # SvelteKit routes
└── static/            # Static assets & Dictionaries
scripts/
└── scrape-quotes.js   # Build-time Rumi quote scraper
```

---

## 📄 License

This project is licensed under the **Mozilla Public License 2.0 (MPL-2.0)** - see the [LICENSE](LICENSE) file for details.

---

**Made with ❤️ by Google Gemini 3 Pro**
