# ECommerce Design Suite

A full-stack e-commerce design and development platform featuring an Express 5 backend, a Vite/React 19 frontend ("ShopNow Electronics"), an interactive visual component mockup sandbox, and OpenAPI-driven type-safe code generation.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — Run the API server (port 5000)
- `pnpm --filter @workspace/shopnow run dev` — Run the ShopNow frontend web app
- `pnpm --filter @workspace/mockup-sandbox run dev` — Run the visual mockup preview sandbox
- `pnpm run typecheck` — Full typecheck across all packages
- `pnpm run build` — Typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — Regenerate API hooks and Zod schemas from `lib/api-spec/openapi.yaml`
- `pnpm --filter @workspace/db run push` — Push Drizzle DB schema changes to PostgreSQL (dev only)
- Required env: `DATABASE_URL` — PostgreSQL connection string

## Stack

- **Monorepo**: `pnpm` workspaces, Node.js 24, TypeScript 5.9
- **Backend API**: Express 5, Pino Logger, Session/Auth handling
- **Database & ORM**: PostgreSQL + Drizzle ORM (`drizzle-zod`)
- **API Spec & Codegen**: OpenAPI 3.1 (`openapi.yaml`) + Orval code generator
- **Validation**: Zod (`zod/v4`)
- **Frontend App**: React 19, Vite, TanStack React Query v5, Wouter routing, Tailwind CSS v4, Radix UI primitives, Lucide Icons, Framer Motion
- **AI Integration**: Custom AI chatbot endpoint with markdown message rendering (`AIChatbot.tsx`, `MarkdownMessage.tsx`)
- **Mockup Preview Canvas**: Dedicated Vite sandbox app using custom file-watching plugin (`mockupPreviewPlugin.ts`) to dynamically import design mockups

## Where things live

- **`lib/api-spec/`**: OpenAPI contract source of truth ([`openapi.yaml`](file:///c:/My%20Projects/ECommerce-Design-Suite/ECommerce-Design-Suite/lib/api-spec/openapi.yaml)) and Orval codegen configuration ([`orval.config.ts`](file:///c:/My%20Projects/ECommerce-Design-Suite/ECommerce-Design-Suite/lib/api-spec/orval.config.ts))
- **`lib/api-zod/`**: Auto-generated Zod schemas for backend request payload validation
- **`lib/api-client-react/`**: Auto-generated React Query hooks for frontend API fetching
- **`lib/db/`**: Drizzle ORM database pool and schemas (`users`, `products`, `cart`, `orders`, `reviews`)
- **`artifacts/api-server/`**: Express 5 server exposing routes for `auth`, `products`, `cart`, `checkout`, `orders`, `reviews`, `recommendations`, `ai`, and `healthz`
- **`artifacts/shopnow/`**: ShopNow Electronics frontend application (pages, components, UI layouts, AI chatbot widget, recommendation widgets)
- **`artifacts/mockup-sandbox/`**: Isolated component preview application with hot-reloading mockup scanner

## Architecture decisions

- **Contract-First Codegen**: All API inputs/outputs are defined in `openapi.yaml`. Orval generates Zod models for server route validation and React Query hooks for client state management, ensuring complete frontend-backend type alignment.
- **Session & Anonymous Cart Sync**: Carts support both guest session tokens and authenticated user IDs, persisting line items cleanly across user transitions.
- **Isolated Component Sandbox**: Mockups in `artifacts/mockup-sandbox` can be developed and previewed independently of production data or backend services.
- **Hybrid AI Recommendations**: Recommendation widgets dynamic switch between anonymous popular items and personalized content/collaborative filtering based on user session state.

## Product

- **E-Commerce Storefront**: Product searching, category filtering, flash deals, interactive product detail page (PDP) with image galleries, specs, and star ratings.
- **User Authentication**: Secure user registration, password hashing with salt, login, session persistence, and logout flow.
- **Reviews & Ratings**: Verified customer product reviews with star ratings, titles, comments, and single-review-per-user enforcement.
- **Smart Recommendations**: Real-time recommendation carousels for Homepage, Product Detail Page (Frequently Bought Together / Hybrid), and Cart Page (Cross-sells).
- **Cart & Checkout**: Interactive side cart drawer / full cart page, promo code application, shipping breakdown, instant checkout form, and order confirmation.
- **Order History**: Authenticated user dashboard displaying historical orders, status timeline, itemized lists, and receipt details.
- **AI Shopping Assistant**: Floating AI Chatbot widget capable of answering product questions, suggesting gifts, and parsing rich formatted Markdown answers.

## User preferences

- Use `pnpm` workspaces exclusively for package management and scripts.
- Prefer contract-first API development: update `openapi.yaml` then run `codegen` when altering API endpoints.

## Gotchas

- **Codegen Order**: Always run `pnpm --filter @workspace/api-spec run codegen` after editing `openapi.yaml` before compiling backend or frontend apps.
- **Database Connection**: Server operations and schema migrations require a valid PostgreSQL connection string set in `DATABASE_URL`.
