# Lumina Admin Suite

E-commerce admin panel and storefront for a phone & accessories shop.

## Tech Stack

- Vite 5 + React 18 + TypeScript
- Tailwind CSS + shadcn/ui
- Supabase (Auth, Database, Edge Functions)
- TanStack React Query
- React Router DOM

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Setup
1. Clone the repository
2. Set up your `.env` file with Supabase credentials (see `.env.example` if available, or use the provided `.env`)
3. Install dependencies: `npm install`
4. Start dev server: `npm run dev`
5. Open http://localhost:8080

### Environment Variables
| Variable | Description |
|---|---|
| `VITE_SUPABASE_URL` | Your Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Your Supabase anon/public key |
| `VITE_SUPABASE_PROJECT_ID` | Your Supabase project ID |

## Scripts
| Command | Description |
|---|---|
| `npm run dev` | Start dev server on port 8080 |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |

