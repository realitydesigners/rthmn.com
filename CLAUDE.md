# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

### Development
```bash
bun run dev          # Start development server with turbopack
bun run build        # Build for production
bun run start        # Start production server
bun run format       # Format code with Biome
```

### Package Management
This project uses **Bun** as the package manager and runtime. Use `bun install` to install dependencies.

## Architecture Overview

This is a **Next.js 15** trading dashboard application with **real-time WebSocket data** and **3D trading visualizations**. The core architecture follows a **provider-based pattern** for state management and data flow.

### Key Technologies
- **Next.js 15** with App Router and React 19
- **TypeScript** (with relaxed strict settings)
- **Tailwind CSS** with atomic CSS patterns
- **Zustand** for client-side state management
- **Supabase** for authentication and database
- **Sanity CMS** for content management
- **Stripe** for payments
- **Three.js** (@react-three/fiber) for 3D visualizations
- **Framer Motion** for animations

### Provider Architecture

The application uses a **cascading provider pattern**:

1. **WebsocketProvider** (`/providers/WebsocketProvider/`) - Manages real-time price data and WebSocket connections
2. **DashboardProvider** (`/providers/DashboardProvider/`) - Orchestrates box calculations and trading pair state
3. **UserProvider** - Handles user authentication and subscription status
4. **SupabaseProvider** - Database and auth integration
5. **QueryProvider** - TanStack Query for server state

### Data Flow Pattern

**Real-time Trading Data Flow:**
```
WebSocket Server → WebSocketProvider → DashboardProvider → ResoBox Components
```

**Key Components:**
- **ResoBox** (`/components/Charts/ResoBox/`) - Core 3D trading visualization using recursive box rendering
- **PairResoBox** (`/app/(user)/dashboard/PairResoBox.tsx`) - Individual trading pair container
- **Box Calculator** (`/utils/boxCalculator.ts`) - Transforms candle data into box structures with 38 different sizes

### State Management with Zustand

**Global Stores** (`/stores/`):
- `colorStore.ts` - UI themes and visual styling (9 color presets)
- `timeframeStore.ts` - Box timeframe settings (global and per-pair)
- `gridStore.ts` - Dashboard layout and pair ordering
- `zenModeStore.ts` - Full-screen zen mode functionality

All stores use **localStorage persistence** with **synchronous initialization** to prevent hydration issues.

### API Structure

**API Routes** (`/app/(admin)/api/config.ts`):
- `/api/getBoxSlice` - Individual box data
- `/api/getLatestBoxSlices` - Latest box data for all pairs
- `/api/getLatestCandles` - Latest candle data
- `/api/getCandles` - Historical candle data

### Performance Optimizations

**Rendering Optimizations:**
- **Atomic CSS** system for efficient styling
- **React.memo** and **useMemo** for expensive calculations
- **requestAnimationFrame** for smooth 60fps updates
- **Hash-based change detection** to prevent unnecessary re-renders

**Memory Management:**
- **Typed Arrays** (Float64Array, Int32Array) for box calculations
- **Object pooling** for frequent updates
- **Proper cleanup** of observers and subscriptions

## File Structure Patterns

### Components Structure
```
/components/
├── Charts/ResoBox/          # Core trading visualization
├── Panels/                  # Dashboard panels and controls
├── Navbars/                 # Navigation components
├── Sections/                # Landing page sections
└── PageBuilder/             # Sanity CMS components
```

### App Router Structure
```
/app/
├── (user)/                  # User-facing routes
│   ├── dashboard/           # Main trading dashboard
│   ├── calculator/          # Risk calculator
│   └── onboarding/          # User onboarding flow
├── (admin)/                 # Admin routes
│   ├── api/                 # API endpoints
│   └── studio/              # Sanity Studio
└── api/                     # Public API routes
```

## Development Guidelines

### TypeScript Configuration
- **Strict mode disabled** for faster development
- **Path aliases**: `@/*` maps to root directory
- **No unused variable checks** - focus on functionality over strict typing

### Styling Approach
- **Tailwind CSS** with custom atomic CSS utilities
- **Responsive design** with mobile-first approach
- **Dynamic styling** based on trading data and user preferences
- **Consistent color system** with 9 predefined themes

### Real-time Data Handling
- **WebSocket connections** use msgpack encoding for efficiency
- **Reconnection logic** with exponential backoff
- **Subscription management** for different data types
- **Mock data** for non-subscribers to demonstrate functionality

### Component Patterns
- **Compound components** for complex UI elements
- **Provider pattern** for state distribution
- **Atomic design** with reusable component system
- **Recursive rendering** for nested box structures

### Testing and Quality
- **Biome** for code formatting and linting
- **Type safety** with TypeScript
- **Performance monitoring** with Vercel Analytics
- **Error boundaries** for graceful error handling

## Key Integration Points

### Supabase Integration
- **Authentication** with multiple providers
- **Row Level Security** for data access
- **Real-time subscriptions** for user data
- **File storage** for user profiles

### Sanity CMS Integration
- **Content management** for marketing pages
- **Course content** for educational features
- **Blog posts** and documentation
- **Custom schema** for trading-related content

### Stripe Integration
- **Subscription management** for premium features
- **Webhook handling** for payment events
- **Customer portal** for account management

## Common Development Tasks

When working on this codebase:

1. **Adding new trading pairs**: Update `instruments.ts` and ensure WebSocket subscriptions handle the new pairs
2. **Modifying box calculations**: Work with `boxCalculator.ts` and ensure performance optimizations are maintained
3. **UI theme changes**: Update `colorStore.ts` and ensure all components use the theme system
4. **API changes**: Update both client and server types, ensure proper error handling
5. **Performance issues**: Check React DevTools Profiler, monitor `requestAnimationFrame` usage, and verify memo usage

## Environment Setup

Required environment variables:
- `NEXT_PUBLIC_SANITY_PROJECT_ID` - Sanity project ID
- `NEXT_PUBLIC_SANITY_DATASET` - Sanity dataset
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key

The application is designed to work with or without these services for development purposes.