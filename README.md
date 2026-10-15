# Collabo (Collaborative Knowledge Board)

Collabo is a TGR Stage 1 project built to organise ideas, tasks, and milestones in one place. Users can create boards, group work into columns, and manage cards with descriptions, tags, and due dates.

## Tech Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS
- Zustand
- Lucide React

## Getting Started

pnpm install
pnpm dev

## Project Structure

- `src/app/` — dashboard and board pages
- `src/components/` — reusable components and providers
- `src/stores/` — Zustand store and state actions
- `src/types/` — TypeScript types for boards, columns, and cards

## State Management

I used Zustand to manage the shared board data. Boards, columns, and cards are stored separately and linked by IDs, which makes individual items easier to update and delete.

The store handles the main CRUD operations, while Zustand's persistence middleware saves the board data to localStorage. A separate hydration component handles loading saved data in the browser.

## Accessibility and Performance

The interface includes keyboard and focus handling for the dashboard dialog, accessible labels, and visible focus styles. The normalised state structure keeps the data organised, while Zustand subscriptions help components access the state they need.
