**# 🤖 Agentic AI Architecture — ShopNow E-Commerce

## Overview

ShopNow implements a **multi-agent conversational AI** system that provides personalized, multi-turn shopping assistance. The system uses Google Gemini for intent classification and a router-based agent dispatch pattern to handle diverse shopping intents — including intelligent profession-based bundle recommendations, inventory-aware product search, and non-electronics guardrails.

---

## System Flow

```mermaid
flowchart TD
    User([👤 User Message]) --> Frontend[🖥️ AIChatbot Component]
    Frontend -->|POST /api/ai/chat<br/>message + history| API[📡 API Route Handler]
    API --> LoadCtx[Load User Context<br/>Orders, Brands, Interests]
    LoadCtx --> Router{🧠 RouterAgent<br/>Intent Classification}

    Router -->|Gemini API| Gemini[🔮 Google Gemini 1.5 Flash<br/>Structured JSON Output]
    Router -->|Fallback| LocalParse[📋 Local Fallback Parser<br/>Regex + Keyword Matching]

    Gemini --> Dispatch
    LocalParse --> Dispatch

    Dispatch{Intent Dispatch} -->|greeting| GA[👋 GreetingAgent]
    Dispatch -->|product_search| PSA[🔍 ProductSearchAgent]
    Dispatch -->|bundle_advisor| BA[🎁 BundleAdvisorAgent]
    Dispatch -->|orders| OA[📦 OrdersAgent]
    Dispatch -->|address| AA[📍 AddressAgent]
    Dispatch -->|top_picks| TPA[⭐ TopPicksAgent]
    Dispatch -->|add_to_cart| ACA[🛒 AddToCartAgent]
    Dispatch -->|unknown| UA[❓ UnknownAgent]

    GA --> Response
    PSA --> Response
    BA --> Response
    OA --> Response
    AA --> Response
    TPA --> Response
    ACA --> Response
    UA --> Response

    Response[📤 AgentResponse<br/>reply + products + followUp] --> Frontend
    Frontend --> Chips[💬 Follow-up Chips<br/>Contextual Suggestions]
    Chips -->|User clicks chip| User
```

---

## Multi-Turn Conversation Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ Frontend
    participant BE as 🧠 RouterAgent
    participant DB as 🗄️ Database

    U->>FE: "I'm a student, want to buy good for me"
    FE->>BE: {message, history: []}
    BE->>BE: Classify → bundle_advisor (persona: student)
    BE-->>FE: {reply: "📚 Got it! What's your budget?", followUp: ["Under ₹30k", "₹50k", "Premium"]}
    FE-->>U: Shows question + suggestion chips

    U->>FE: Clicks "Around ₹50,000 (Good value)"
    FE->>BE: {message, history: [prev messages]}
    BE->>BE: BundleAdvisor detects persona+budget → builds bundle
    BE->>DB: Query Laptops + Audio + Accessories (inventory-aware)
    BE-->>FE: {reply: "📚 Student Bundle!", products[3], followUp: ["Add all to cart", "Swap laptop", "Cheaper?"]}
    FE-->>U: Bundle with 3 products + total price + chips

    U->>FE: Clicks "Add all to cart"
    FE->>BE: {message: "Add all to cart", history: [...]}
    BE->>BE: Classify → add_to_cart (bulk mode)
    BE->>DB: Find products from history → INSERT all into cart
    BE-->>FE: {reply: "✅ Added 3 items!", products[3], followUp: ["Checkout", "More accessories"]}
    FE-->>U: Confirmation + next steps
```

---

## Agent Architecture

### Directory Structure

```
artifacts/api-server/src/agents/
├── index.ts                    # Barrel exports
├── types.ts                    # Shared interfaces
├── router-agent.ts             # 🧠 Brain — intent classification + dispatch
├── user-context.ts             # Loads user profile from DB
├── greeting-agent.ts           # 👋 Welcome + personalization
├── product-search-agent.ts     # 🔍 Cascading product search with keyword intelligence
├── bundle-advisor-agent.ts     # 🎁 Profession-based bundle recommendations
├── top-picks-agent.ts          # ⭐ History-based recommendations
├── orders-agent.ts             # 📦 Order history (login-gated)
├── address-agent.ts            # 📍 Shipping address (login-gated)
├── add-to-cart-agent.ts        # 🛒 Single + bulk add via conversation
└── unknown-agent.ts            # ❓ Fallback + suggestions
```

---

## Core Interfaces

```typescript
interface AgentContext {
  message: string;
  userId: number | null;
  userContext: UserContext;
  history?: Array<{ role: string; content: string }>;
}

interface AgentResponse {
  reply: string;           // Natural language response
  products: any[];         // Product cards to display
  orders: any[];           // Order cards to display
  requiresLogin?: boolean; // Show login button
  followUp?: string[];     // Suggestion chips for next turn
  userContext: { ... };    // User metadata
}

interface UserContext {
  name?: string;
  recentOrders?: Array<{ id, totalAmount, status, products[] }>;
  lastAddress?: any;
  interests?: string[];           // Categories from order history
  purchasedProductIds?: number[]; // Already bought (exclude from recs)
  purchasedBrands?: string[];     // Preferred brands
}
```

---

## Agent Details

### 🧠 RouterAgent (Brain)

| Feature                | Implementation                                                                                             |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| **Primary**            | Google Gemini 1.5 Flash with structured JSON schema                                                        |
| **Fallback**           | Local regex/keyword parser (no API key needed)                                                             |
| **Context**            | Passes conversation history for multi-turn awareness                                                       |
| **Intents**            | `greeting`, `product_search`, `bundle_advisor`, `orders`, `address`, `top_picks`, `add_to_cart`, `unknown` |
| **Keyword Extraction** | Explicit model name extraction (e.g. "Galaxy S22" → keyword)                                               |
| **Guardrails**         | Non-electronics requests redirected with helpful message                                                   |

### 🔍 ProductSearchAgent (Cascading Search)

```mermaid
flowchart TD
    Start[User Query] --> L1{Level 1:<br/>Full keyword + category}
    L1 -->|Results found| Return[Return products]
    L1 -->|No results| L2{Level 2:<br/>Split keyword into parts<br/>Match ANY part}
    L2 -->|Results found| Return
    L2 -->|No results| L3{Level 3:<br/>Category + brand only<br/>Drop keyword}
    L3 -->|Results found| Return
    L3 -->|No results| L4[Level 4:<br/>Category only<br/>Top rated]
    L4 --> Return
```

- **Cascading strategy**: Specific → progressively broader (never returns empty)
- Builds Drizzle ORM queries with category/price/brand/keyword filters
- Only shows in-stock products (limit 6)
- **Generates smart follow-ups** based on results, budget, brands, category

### 🎁 BundleAdvisorAgent (Profession-Based Bundles)

```mermaid
flowchart TD
    Start[User Message] --> Guard{Non-Electronics<br/>Guardrail}
    Guard -->|clothes, food, etc.| Redirect[Politely redirect<br/>to electronics]
    Guard -->|Electronics OK| Persona{Detect Persona}

    Persona -->|Not detected| AskPersona[Ask: What do you do?<br/>Student/Gamer/Professional/...]
    Persona -->|Detected| Ready{Enough Context?}

    Ready -->|Need more info| AskNeeds[Ask about needs/budget]
    Ready -->|Ready| Inventory[Check Store Inventory]

    Inventory --> Build[Build Curated Bundle<br/>1 product per category]
    Build --> Scale[Scale prices to budget]
    Scale --> Response[Show Bundle + Total Price<br/>+ Add All to Cart]

    AskPersona -->|User answers| Persona
    AskNeeds -->|User answers| Ready
```

**Supported Professions (10):**

| Persona      | Emoji | Bundle Categories                                    |
| ------------ | ----- | ---------------------------------------------------- |
| Student      | 📚    | Laptop + Headphones + Accessories                    |
| Gamer        | 🎮    | Gaming Laptop + Headset + Peripherals                |
| Professional | 💼    | Work Laptop + NC Headphones + Ergonomics             |
| Creator      | 🎬    | Camera + Audio + Editing Laptop                      |
| Doctor       | 🩺    | Portable Laptop + Phone + Headphones                 |
| Teacher      | 👩‍🏫    | Laptop + Webcam/Accessories + Headset                |
| Architect    | 🏗️    | Powerful Laptop + Precision Mouse + Focus Headphones |
| Musician     | 🎵    | Studio Headphones + Production Laptop + Audio Gear   |
| Photographer | 📸    | Camera + Editing Laptop + Accessories                |
| Freelancer   | 🏠    | Versatile Laptop + NC Headphones + Office Essentials |

**Key Intelligence Features:**

- ✅ **Inventory-aware** — checks actual stock before recommending
- ✅ **Budget scaling** — scales all item prices proportionally to budget
- ✅ **Guardrails** — rejects non-electronics (clothes, food, furniture, etc.)
- ✅ **Multi-turn** — asks follow-up questions before building bundle
- ✅ **Suggests alternatives** when items are out of stock

### 🛒 AddToCartAgent (Single + Bulk)

| Mode       | Trigger                              | Behaviour                                                      |
| ---------- | ------------------------------------ | -------------------------------------------------------------- |
| **Single** | "add to cart"                        | Adds top product from conversation context                     |
| **Bulk**   | "add all to cart" / "add everything" | Parses product names from recent AI messages, adds ALL to cart |

- Reads `**Product Name**` patterns from assistant messages in history
- Checks for duplicates (already in cart)
- Returns total for all added items + checkout follow-up

### ⭐ TopPicksAgent (Recommendation Engine)

```mermaid
flowchart TD
    Start{Has Order History?}
    Start -->|Yes| P1[Priority 1: Same brands<br/>not already purchased]
    Start -->|Has interests only| P3[Query by interest categories]
    Start -->|Guest/No data| P4[Top-rated in-stock products]

    P1 --> P2[Priority 2: Same categories<br/>new brands to discover]
    P2 --> Merge[Merge & cap at 5 products]
    Merge --> Fill{< 3 results?}
    Fill -->|Yes| Filler[Fill with top-rated stock]
    Fill -->|No| Done[Return with follow-ups]
    Filler --> Done

    P3 --> Done
    P4 --> Done
```

### 🔐 Login-Gated Agents (Orders, Address, AddToCart)

- Check `userId` before executing
- Return `requiresLogin: true` + friendly prompt
- Frontend renders an inline "Log In →" button

---

## Guardrails & Safety

### Non-Electronics Guardrail

The system detects requests for non-electronics categories and politely redirects:

```
❌ "I want to buy shoes"
→ "I'm specialized in electronics & tech — laptops, phones, headphones, cameras, and accessories!
   I can't help with "shoes" unfortunately. But I can help you find the perfect tech setup!"
```

**Blocked categories:** Clothing, food/grocery, furniture, cosmetics, books/stationery, toys, kitchenware, sports equipment, medicine, jewellery, vehicles.

### Intent Misclassification Prevention

| User Says                     | Correct Intent                         | Wrong Intent (prevented) |
| ----------------------------- | -------------------------------------- | ------------------------ |
| "I want to buy Galaxy S22"    | `product_search` (keyword: Galaxy S22) | ~~add_to_cart~~          |
| "I'm a student, need a setup" | `bundle_advisor`                       | ~~product_search~~       |
| "Add all to cart"             | `add_to_cart` (bulk)                   | ~~unknown~~              |
| "Show me shoes"               | Guardrail redirect                     | ~~product_search~~       |

---

## Frontend Integration

### AIChatbot Component

```mermaid
flowchart LR
    Input[User Types / Clicks Chip] --> Mutation[useMutation<br/>POST /api/ai/chat]
    Mutation --> Parse[Parse Response]
    Parse --> Msg[Render Message Bubble]
    Parse --> Products[Render Product Cards<br/>with Add to Cart buttons]
    Parse --> Orders[Render Order Cards<br/>with status badges]
    Parse --> Login[Render Login Button<br/>if requiresLogin]
    Parse --> Chips[Render Follow-up Chips<br/>only on last message]
    Chips -->|onClick| Input
```

**Key Features:**

- Sends last 8 messages as `history[]` for context
- Follow-up chips only render on the **most recent** AI message
- Product cards have inline "Add to Cart" buttons
- Order cards link to `/orders` page
- Login buttons link to `/login` page
- Bundle responses show total price + "Add all to cart" chip

---

## Data Flow: User Context Loading

```mermaid
flowchart TD
    Cookie[🍪 session_user_id cookie] --> Parse[Parse userId]
    Parse --> Query1[Query users table → name]
    Parse --> Query2[Query orders + order_items + products<br/>JOIN last 20 items]

    Query2 --> Extract[Extract from results:]
    Extract --> Categories[📂 interests = unique categories]
    Extract --> Brands[🏷️ purchasedBrands = unique brands]
    Extract --> IDs[🔢 purchasedProductIds = product IDs]
    Extract --> Orders[📦 recentOrders = last 3 orders]
    Extract --> Address[📍 lastAddress = shipping info]

    Categories --> UC[UserContext Object]
    Brands --> UC
    IDs --> UC
    Orders --> UC
    Address --> UC
    Query1 --> UC
```

---

## Example Conversations

### 📚 "I'm a student, want to buy good for me" (Bundle Flow)

| Turn | User                                     | Agent         | Response                                                                                                        |
| ---- | ---------------------------------------- | ------------- | --------------------------------------------------------------------------------------------------------------- |
| 1    | "I am a student want to buy good for me" | BundleAdvisor | "📚 Got it! I'll build a student bundle. What's your budget?" + chips: `Under ₹30k` `₹50k` `₹80k` `No limit`    |
| 2    | "Around ₹50,000"                         | BundleAdvisor | Shows 3-item bundle (Laptop ₹35k + Headphones ₹4k + Mouse ₹2k) = ₹41k ✅ within budget + "Add all to cart" chip |
| 3    | "Add all to cart"                        | AddToCart     | ✅ Added 3 items to cart! Total: ₹41,000 + chips: `Checkout` `More accessories`                                 |

### 🎮 "I need a gaming setup" (Bundle Flow)

| Turn | User                          | Agent         | Response                                                     |
| ---- | ----------------------------- | ------------- | ------------------------------------------------------------ |
| 1    | "I need a gaming setup"       | BundleAdvisor | "🎮 Got it! I'll build a gaming bundle. What's your budget?" |
| 2    | "₹1 lakh"                     | BundleAdvisor | Shows Gaming Laptop + Gaming Headset + Gaming Mouse bundle   |
| 3    | "Swap the laptop for cheaper" | BundleAdvisor | Shows updated bundle with budget laptop                      |

### 🔍 "I want Galaxy S22" (Specific Product Search)

| Turn | User                       | Agent         | Response                                                             |
| ---- | -------------------------- | ------------- | -------------------------------------------------------------------- |
| 1    | "I want to buy Galaxy S22" | ProductSearch | Cascading search: keyword "Galaxy S22" → Samsung phones matching S22 |
| 2    | "Under ₹30,000"            | ProductSearch | Filtered by price + chips: `Add best to cart` `Show alternatives`    |
| 3    | "Add best to cart"         | AddToCart     | ✅ Added! + chips: `More Mobiles` `Accessories` `Checkout`           |

### 👟 "I want shoes" (Guardrail)

| Turn | User                  | Agent         | Response                                                                                                                                                |
| ---- | --------------------- | ------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1    | "I want to buy shoes" | BundleAdvisor | "I'm specialized in electronics & tech! Can't help with shoes. What do you use technology for?" + chips: `I need a laptop` `Best phone` `I'm a student` |

---

## Technology Stack

| Layer    | Technology                                       |
| -------- | ------------------------------------------------ |
| AI Model | Google Gemini 1.5 Flash (structured JSON output) |
| Backend  | Express 5.x + TypeScript                         |
| Database | PostgreSQL + Drizzle ORM                         |
| Frontend | React 18 + TanStack Query + Tailwind CSS         |
| Routing  | wouter (frontend), Express Router (backend)      |
| Monorepo | pnpm workspaces                                  |

---

## Security & Guards

- **Login gates**: Orders, Address, AddToCart require authentication
- **Session isolation**: Cart uses `user_{id}` session IDs
- **Input validation**: Message required, history capped at 8 entries
- **API key fallback**: Works without Gemini API key via local parser
- **No PII in logs**: Only intent name + agent name logged
- **Non-electronics guardrail**: Blocks out-of-domain requests gracefully
- **Intent protection**: "buy X" ≠ add_to_cart, prevents wrong cart additions

---

## Build & Run

```bash
# Build API server
cd artifacts/api-server && pnpm run build

# Start server
node --enable-source-maps --import ./dist/preload.mjs ./dist/index.mjs

# Or use run-local.ps1 option 7
```

**
