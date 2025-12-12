# Pokémon Explorer

A modern, full-featured Pokémon Explorer web application built with Next.js 14, React 18, TypeScript, and TailwindCSS. Explore and discover Pokémon with detailed information, stats, abilities, and moves.

## Features

- 🎯 **Homepage with Infinite Scroll** - Browse Pokémon with smooth infinite scrolling
- 🔍 **Search & Filter** - Search by name and filter by type
- 📊 **Detailed Pokémon Pages** - View comprehensive information including:
  - Base stats with radar chart visualization
  - Abilities (including hidden abilities)
  - Complete moves list
  - Type information with color-coded badges
- 🎨 **Modern UI** - Clean, responsive design with TailwindCSS
- 🌙 **Dark Mode** - Toggle between light and dark themes
- ⚡ **Performance Optimized** - Server-side rendering, static generation, and image optimization
- 🎭 **Smooth Animations** - Framer Motion animations for enhanced UX
- 📱 **Fully Responsive** - Works seamlessly on all device sizes

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Validation**: Zod
- **Testing**: Vitest
- **API**: [PokéAPI](https://pokeapi.co/)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, pnpm, or bun

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd pokemon-app
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run tests with Vitest
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## Project Structure

```
src/
  app/                    # Next.js App Router pages
    layout.tsx           # Root layout with theme provider
    page.tsx             # Homepage
    pokemon/
      [id]/
        page.tsx         # Dynamic detail page
  components/
    ui/                  # Reusable UI components
    pokemon/             # Pokemon-specific components
  hooks/                 # Custom React hooks
  lib/
    api/                 # API functions and tests
    utils/               # Utility functions
  store/                 # Zustand state management
  types/                 # TypeScript type definitions
```

## Architecture

- **Server Components**: Initial data fetching on the server
- **Client Components**: Interactive features (search, filters, infinite scroll)
- **State Management**: Zustand for global state (search, filters, theme)
- **API Layer**: Typed API functions with Zod validation
- **Performance**: Static generation for first 151 Pokémon, ISR for others

## Features in Detail

### Infinite Scroll
Uses Intersection Observer API to load more Pokémon as you scroll, providing a smooth browsing experience.

### Search & Filter
- Real-time search with debouncing
- Multi-select type filtering
- Client-side filtering for instant results

### Dark Mode
Persistent theme preference stored in localStorage, with smooth transitions.

### Type Badges
Color-coded badges for all 18 Pokémon types with proper contrast ratios.

## Testing

Run tests with:
```bash
npm run test
```

Tests are written with Vitest and include API function validation tests.

## Code Quality

- TypeScript strict mode enabled
- ESLint configured with Next.js rules
- Prettier for code formatting
- Zero TypeScript errors
- Proper type safety throughout

## License

MIT

## Acknowledgments

- [PokéAPI](https://pokeapi.co/) for providing the Pokémon data
- Next.js team for the amazing framework
- All Pokémon fans and developers
