# FiveM NUI Boilerplate (Svelte 5 + Tailwind CSS v4 + Shadcn Svelte)

Boilerplate template for FiveM NUI scripts using Svelte 5, Tailwind CSS v4, and Shadcn Svelte UI components.

## Features
- **Svelte 5** (`runes` mode: `$state`, `$derived`, `$props`, etc.)
- **Tailwind CSS v4** & **tw-animate-css**
- **Shadcn Svelte** (Bits UI + Tailwind Variants)
- **FiveM NUI Helpers**:
  - `fetchNui` (communicates with client Lua)
  - `useNuiEvent` (handles incoming Lua `SendNUIMessage`)
  - `debugData` & `isEnvBrowser` (browser development & mock events)
- **UI Components Included**: `alert-dialog`, `badge`, `button`, `card`, `dialog`, `input`, `pagination`.

## Setup & Dev

```bash
# Install dependencies
bun install # or npm install / pnpm install

# Start development server (supports browser mode)
bun run dev

# Build for FiveM production
bun run build
```
