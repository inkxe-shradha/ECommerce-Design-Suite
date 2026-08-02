# 🤖 Agentic AI Architecture — ShopNow E-Commerce

## Overview

ShopNow implements a **supervisor-driven, graph-style multi-agent conversational AI** system that provides personalized, multi-turn shopping assistance. The system features an **Adaptive Self-Correction & Error Recovery Engine**, a pluggable model-provider layer for intent classification, a supervisor for orchestration and fault-tolerant fallbacks, and a deterministic PC Builder engine supporting complete 8-component gaming rigs.

---

## System Flow

```mermaid
flowchart TD
    User([👤 User Message]) --> Frontend[🖥️ AIChatbot Component]
    Frontend -->|POST /api/ai/chat<br/>message + history| API[📡 API Route Handler]
    API --> LoadCtx[Load User Context<br/>Orders, Brands, Interests]
    LoadCtx --> Supervisor[🧠 SupervisorAgent]
    
    Supervisor --> SelfCorrection{Self-Correction Engine<br/>detectCorrection}
    SelfCorrection -->|User Correction Detected| PrependPrefix[Format Empathetic Acknowledgment]
    SelfCorrection --> Router{RouterAgent<br/>Intent Classification}

    Router -->|Gemini API| Gemini[🔮 Google Gemini Flash Models<br/>Structured JSON Output]
    Router -->|OpenAI-compatible provider| OpenCode[⚡ OpenAI-compatible JSON provider<br/>AI_PROVIDER=opencode]
    Router -->|Fallback| LocalParse[📋 Local Fallback Parser<br/>Regex + Keyword Matching]

    Gemini --> Clarify{Clarification Policy}
    OpenCode --> Clarify
    LocalParse --> Clarify
    Clarify -->|Budget only, no target| Clarification[Ask category with follow-up chips]
    Clarify -->|Target supplied| Dispatch

    Dispatch{AgentGraph / GraphRunner} -->|greeting| GA[👋 GreetingAgent]
    Dispatch -->|product_search| PSA[🔍 ProductSearchAgent]
    Dispatch -->|bundle_advisor| BA[🎁 BundleAdvisorAgent]
    Dispatch -->|gaming_build| GBA[🎮 GamingBuildAdvisorAgent]
    Dispatch -->|orders| OA[📦 OrdersAgent]
    Dispatch -->|address| AA[📍 AddressAgent]
    Dispatch -->|top_picks| TPA[⭐ TopPicksAgent]
    Dispatch -->|add_to_cart| ACA[🛒 AddToCartAgent]
    Dispatch -->|unknown| UA[❓ UnknownAgent]

    GBA --> PCBuilder[🖥️ pc-builder Service<br/>Full 8-Component Rig Engine]
    GBA --> BrandDiscovery[🏷️ Stockpile Brand Chooser<br/>ASUS, MSI, Gigabyte, Zotac, etc.]
    GBA --> CouponEngine[🎟️ Inline Coupon Savings Calculator<br/>BUILD50K, GAMING10, CPU15, GPU5K]

    GA --> Guardrail[🛡️ GuardrailAgent<br/>Response contract validation]
    PSA --> Guardrail
    BA --> Guardrail
    GBA --> Guardrail
    OA --> Guardrail
    AA --> Guardrail
    TPA --> Guardrail
    ACA --> Guardrail
    UA --> Guardrail

    Clarification --> Guardrail
    Guardrail --> Response[📤 AgentResponse<br/>reply + products + orders + followUp]
    Response --> Frontend
    Frontend --> Chips[💬 Follow-up Chips<br/>Contextual Suggestions]
    Chips -->|User clicks chip| User
```

---

## Multi-Turn Conversation & Self-Correction Flow

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant FE as 🖥️ Frontend
    participant SA as 🧠 SupervisorAgent / Self-Correction
    participant GBA as 🎮 GamingBuildAdvisorAgent
    participant DB as 🗄️ Database / pc-builder

    U->>FE: "I want to build my PC"
    FE->>SA: {message: "I want to build my PC", history: []}
    SA->>GBA: Classify → gaming_build
    GBA-->>FE: {reply: "🎮 What is your budget in INR?", followUp: ["₹80,000", "1.5 lakh", "2.5 lakh"]}
    FE-->>U: Shows budget prompt + chips

    U->>FE: "1.5 lakh"
    FE->>SA: {message: "1.5 lakh", history: [...]}
    SA->>GBA: Decimal Budget Parser (1.5 lakh = ₹150,000)
    GBA->>DB: Query 8 Components (CPU, GPU, RAM, Storage, Cooler, PSU, Motherboard, Case)
    GBA-->>FE: {reply: "## 🖥️ Your Gaming PC Build — ₹1,00,538", products[8], followUp: ["Yes, add to cart", "Swap GPU to Nvidia", "Can I save with a coupon?"]}
    FE-->>U: Shows 8-component build + total price + swap chips

    U->>FE: "No I meant AMD GPU instead"
    FE->>SA: {message: "No I meant AMD GPU instead", history: [...]}
    SA->>SA: detectCorrection → Brand Correction Detected!
    SA->>GBA: Override gpuBrand = AMD → Re-run build
    GBA-->>FE: {reply: "💡 Understood! My apologies for the brand mixup. ## 🖥️ Your gaming PC Build — ₹88,136", products[8]}
    FE-->>U: Empathetic acknowledgment + updated AMD build
```

---

## Agent Architecture

### Directory Structure

```
artifacts/api-server/src/agents/
├── index.ts                    # Barrel exports
├── types.ts                    # Shared interfaces
├── supervisor-agent.ts         # 🧠 Orchestrates agent workflow + fault-tolerant recovery
├── self-correction-engine.ts   # 💡 Detects user corrections & generates empathetic self-correcting prefixes
├── router-agent.ts             # Intent classification + active conversation persistence
├── clarification-policy.ts     # Stops vague budget-only catalog searches
├── gaming-build-advisor-agent.ts # 🎮 8-Component PC Build advisor, brand chooser & inline coupon calculator
├── agent-graph.ts              # Specialist nodes and intent edges
├── graph-runner.ts             # Executes the selected graph path
├── guardrail-agent.ts          # Validates final frontend response contract
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

interface CorrectionAnalysis {
  isCorrection: boolean;
  correctionType?: 'budget' | 'brand' | 'category' | 'component' | 'intent' | 'general';
  correctedValue?: string | number;
  explanation?: string;
}
```

---

## Key Agent Capabilities

### 💡 Self-Correction & Error Recovery Engine (`self-correction-engine.ts`)

- **User Correction Detection**: Scans user input for correction patterns (`"no I meant"`, `"that's not what I asked"`, `"I already said"`, `"you misunderstood"`, `"wrong brand"`).
- **Empathy & Learning**: Generates natural, apologetic acknowledgment prefixes (`"💡 Understood! My apologies for the brand mixup. I've updated the brand filter for you:"`).
- **Fault Tolerance**: Wraps graph execution in `try-catch` blocks. If downstream API calls or LLM services fail, `SupervisorAgent` triggers a self-healing fallback response instead of breaking the chat.

### 🎮 GamingBuildAdvisorAgent & Deterministic PC Builder (`pc-builder.ts`)

- **Full 8-Component Rigs**: Recommends complete, compatible hardware configurations across **Processor**, **CPU Cooler**, **Graphics Card**, **RAM**, **Storage**, **Power Supply**, **Motherboard** (404 items in catalog), and **Case / Cabinet** (629 items in catalog).
- **Decimal & Multi-Format Budget Parser**: Converts inputs like `1.5 lakh`, `1.5L`, `150k`, `₹1,50,000`, `1.5` to ₹150,000.
- **Stockpile Brand Chooser**:
  - Dynamically queries live in-stock brands for any component type (`ASUS`, `MSI`, `Gigabyte`, `Zotac`, `ASRock`, `Galax`, `Inno3D`, `Corsair`, `Fractal Design`, `Lian Li`, `NZXT`).
  - Handles requests for unstocked or future hardware (e.g. `"I want to add the NVIDIA 5090 card"`) by informing the user of catalog availability and presenting a 1-tap brand discovery menu.
- **Inline Coupon Calculator**:
  - Calculates exact promo code savings directly inside the PC build flow without losing context.
  - Highlights `BUILD50K` (flat ₹5,000 off), `GAMING10` (10% off), `CPU15` (15% off CPU), `GPU5K` (flat ₹5,000 off GPU).

---

## Security & Safety

- **Login gates**: Orders, Address, AddToCart require authentication
- **Session isolation**: Cart uses `user_{id}` or `default` session IDs
- **Input validation**: Message required, history capped at 8 entries
- **Provider fallback**: Works seamlessly without an API key using the local regex/keyword parser
- **No PII in logs**: Only intent name + agent name logged
- **Non-electronics guardrail**: Gracefully blocks out-of-domain requests
