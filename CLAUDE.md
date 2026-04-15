# Claude Code Configuration

This project uses Claude Code for development and testing.

## Key Files
- Package management: `package.json`
- TypeScript config: `tsconfig.json`
- Next.js config: `next.config.ts`
- State management: `src/store/useGameModeStore.ts`
- Main page: `src/app/page.tsx`

## Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint

## Architecture
- **Frontend**: Next.js 16 with React 19
- **Desktop**: Tauri 2.x (Windows)
- **State**: Zustand for global state
- **UI**: Tailwind CSS + shadcn/ui
