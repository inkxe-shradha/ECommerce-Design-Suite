# Gaming PC Builder and Category-Aware Coupons

## Goal

Add a Gaming product area that can import the supplied PC component catalog, guide customers through a compatible gaming-PC recommendation in the AI chatbot, request explicit confirmation before adding the build to the cart, and provide a database-backed coupon system whose offers are valid only for the eligible categories/components/products.

## Scope Decisions

- Import the supplied catalog first. It has 101 items across Processor, CPU Cooler, Graphics Card, RAM, Storage, and Power Supply.
- Only copy the PC-component categories from this JSON into Gaming. Do not import mobile, laptop, or unrelated catalog categories into the Gaming section.
- Add a second matching catalog export before claiming the chatbot can recommend a complete compatible desktop. That export must cover motherboards, cases, monitors, and peripherals with compatibility data.
- The chatbot produces one best deterministic build after collecting a compact brief, then asks for one explicit confirmation before bulk add-to-cart.
- Coupons support percentage and fixed discounts, category/component/product eligibility, minimum spend, dates, global and per-user limits, no stacking, and automatic selection of the best eligible offer.
- Cart, checkout, and chatbot quotes share one server-side pricing engine. The client and LLM display the quote but never decide eligibility or totals.
- Supplier API synchronization, an admin campaign-management UI, price scraping, real payment integration, and claims of complete builds from the partial catalog are excluded from this delivery.

## 1. Define Catalog Taxonomy and Migration Contract

- Extend `productsTable` in `lib/db/src/schema/products.ts` with:
  - `department` for top-level commerce grouping, such as `Gaming`.
  - `componentType` for `Processor`, `CPU Cooler`, `Graphics Card`, `RAM`, `Storage`, `Power Supply`, `Motherboard`, `Case`, `Monitor`, and `Peripheral`.
  - `externalId` as a unique supplier/source product identifier.
  - `sourceUrl` for the supplier product page.
  - `images` as a JSON/text array for gallery images.
- Preserve the existing `category` field during the transition so existing storefront behavior remains compatible.
- Replace the undocumented `specs` text convention with validated serialized JSON. Preserve raw supplier specifications while normalizing compatibility keys, including:
  - CPU socket.
  - Motherboard socket, chipset, and form factor.
  - Cooler supported sockets and radiator size.
  - RAM generation.
  - GPU length and power connectors.
  - PSU wattage and connectors.
  - Case form-factor support, GPU clearance, and cooler clearance.
  - Storage interface.
- Add indexes for `department + componentType`, source identity, and compatibility attributes used by the builder.
- Create a repeatable idempotent import path instead of expanding the hand-authored seed array.
- Create an import module that validates `pc_components_shopnow.json`, maps only the six supplied PC-component groups to `department = Gaming`, serializes specifications/image arrays, preserves INR price/stock data, and produces a reject report for malformed or non-PC records.
- Use `externalId` for upserts, preventing duplicate catalog entries on reruns.
- Define a separate import contract and fixture requirement for the forthcoming motherboard, case, monitor, and peripheral export. Do not enable full-PC builder claims until that import has succeeded.

## 2. Build the Gaming Catalog Experience

- Extend product search and category endpoints in `artifacts/api-server/src/routes/products.ts` to filter by department and component type without breaking existing flat-category callers.
- Update `lib/api-spec/openapi.yaml`, then regenerate `@workspace/api-zod` and `@workspace/api-client-react`. Do not manually edit generated files.
- Add a Gaming landing/category route and component-type navigation in:
  - `artifacts/shopnow/src/App.tsx`
  - `artifacts/shopnow/src/pages/HomePage.tsx`
  - `artifacts/shopnow/src/pages/CategoryPage.tsx`
- Support `/category/Gaming` for all Gaming products and component filtering for Processor, CPU Cooler/AIO, Graphics Card, RAM, Storage, Power Supply, and future component types.
- Update `artifacts/shopnow/src/pages/PDPPage.tsx` to show gallery images and structured specifications while preserving generic product rendering for current catalog products.

## 3. Create Deterministic PC Compatibility and Recommendation Services

- Add a narrow backend domain service, for example `artifacts/api-server/src/services/pc-builder.ts`; do not place compatibility logic inside an LLM prompt.
- The service receives a normalized build brief plus product candidates, selects compatible components, calculates power headroom and totals, records rationale, and reports validation failures when inventory or required component types are missing.
- Define the build brief:
  - Total budget.
  - Main games/workload.
  - Target resolution and refresh rate.
  - Streaming/content-creation needs.
  - Aesthetic and form-factor preferences.
  - CPU/GPU brand preferences.
  - Whether the budget includes monitor/peripherals.
- Infer sensible defaults only when users explicitly have no preference.
- Rank candidates by deterministic constraints first: socket, RAM generation, form factor, clearance, PSU capacity/connectors, storage interface, and stock. Apply price/performance heuristics after compatibility.
- The LLM may explain results, but must not override compatibility checks or cart pricing.
- Before the missing catalog import is available, return a clearly labeled partial core-components recommendation and guide users to browse parts. After the catalog is complete, return one full compatibility-checked PC build.

## 4. Integrate Guided Builds into the Chatbot

- Add `gaming_build` to `ParsedIntent` and implement `GamingBuildAdvisorAgent`.
- Reuse multi-turn patterns from:
  - `artifacts/api-server/src/agents/bundle-advisor-agent.ts`
  - `artifacts/api-server/src/agents/clarification-policy.ts`
- Register the agent in:
  - `artifacts/api-server/src/agents/router-agent.ts`
  - `artifacts/api-server/src/agents/agent-graph.ts`
  - The supervisor/graph-runner path.
- Add conservative local fallback triggers for phrases such as `build gaming PC`, `PC build`, `gaming rig`, component compatibility questions, and gaming resolution/budget phrases, so the flow functions without Gemini.
- Persist the in-progress build brief and selected product IDs in a signed server-side session or a dedicated build-session table tied to the existing cart/session identity. Do not rely only on the browser's chat history because confirmations and substitutions must survive reloads and cannot be client-forged.
- Reuse the existing agent response shape and product/add-to-cart cards in `artifacts/shopnow/src/components/AIChatbot.tsx`.
- Add a typed `pcBuild` payload containing:
  - Compatible parts list.
  - Compatibility result.
  - Build total.
  - Eligible coupon quote.
  - One explicit `Add complete build` action.
- Use a transactional bulk-cart endpoint or safe extension of the existing add-to-cart flow. Revalidate inventory and final price server-side.
- The chatbot must require confirmation before adding a complete configuration to the cart.

## 5. Design and Migrate the Promotion Data Model

- Add `couponsTable` in `lib/db/src/schema/coupons.ts` with:
  - Immutable ID.
  - Case-insensitive unique code.
  - Campaign name and description.
  - Active/start/end state.
  - Discount type: `percent` or `fixed`.
  - Discount value.
  - Maximum discount cap.
  - Minimum eligible subtotal.
  - Global use limit.
  - Per-user use limit.
  - Stackability flag, initially `false`.
  - Auto-apply eligibility.
  - Priority.
  - Audit timestamps.
- Add a normalized `couponRulesTable` rather than an array-only column. Each coupon may target a department, component type, category, or specific product. Its include/exclude mode supports Gaming-wide, component-specific, and selected-product promotions without schema changes.
- A coupon with no inclusion rule applies to all products subject to its other constraints.
- Add `couponRedemptionsTable` with coupon/order/user identifiers, code snapshot, discount amount, eligible subtotal, timestamp, and a unique order relationship. This is the auditable, concurrency-safe source for usage limits.
- Extend `ordersTable` in `lib/db/src/schema/orders.ts` with immutable monetary snapshots:
  - `subtotalAmount`.
  - `productDiscountAmount`.
  - `couponDiscountAmount`.
  - `shippingAmount`.
  - `totalAmount`.
  - `appliedCouponCode`.
  - Structured coupon snapshot.
- Preserve snapshot data even if a coupon is later modified or disabled.
- Add an optional cart-level selected-coupon field in existing cart/session persistence or a small `cartPromotionsTable` keyed by cart/session. It stores user selection but is never trusted as validated.
- Seed representative active/inactive Gaming and general coupons, including percentage, fixed-value, category-only, minimum-spend, expired, capped-use, and per-user-limited cases.

## 6. Replace Cart and Checkout Pricing with One Promotion Engine

- Create `artifacts/api-server/src/services/pricing.ts` as the only pricing authority.
- Given cart lines, customer identity, and an optional coupon code, it must:
  - Determine line eligibility.
  - Apply product markdowns separately.
  - Evaluate non-stackable coupons.
  - Select the best auto-applicable coupon when a valid manual code does not take precedence.
  - Cap discounts.
  - Return an itemized quote and rejection reasons.
- Refactor `artifacts/api-server/src/routes/cart.ts` to remove hardcoded `TECH20` and fixed 20% discount logic.
- Add coupon apply/remove and available-coupon/quote endpoints. The cart response includes selected/auto-applied coupon, eligible subtotal, line/coupon discounts, savings, and clear validation messages.
- Refactor `artifacts/api-server/src/routes/checkout.ts` to re-read cart lines and run the same pricing service inside one database transaction.
- Lock or atomically account for coupon limits, create order/redemption/snapshot rows with quoted amounts, and fail clearly when stock, campaign state, or use limits changed.
- This fixes the existing mismatch where checkout ignores the cart discount.
- Extend OpenAPI and regenerate Zod schemas/React Query hooks only after endpoint shapes are agreed.

## 7. Expose Coupons in the Storefront and Chatbot

- Add a compact coupon entry and applied-offer summary to:
  - `artifacts/shopnow/src/pages/CartPage.tsx`
  - `artifacts/shopnow/src/pages/CheckoutPage.tsx`
- Include manual code entry, automatically applied best offer, eligible/ineligible explanation, removal, and final total based on the server quote.
- Add a coupon intent/agent or targeted route to the existing agent graph. It queries the same promotion service to answer questions such as `What coupon works for Gaming?` and can apply an explicitly requested code.
- The chatbot only mentions currently active and eligible coupons, and shows estimated savings based on the active cart/build.
- Include the evaluated coupon quote in the PC-builder response before confirmation, and rerun the pricing quote after bulk-cart insertion so users see the actual eligible promotion.

## 8. Test, Document, and Release in Dependency Order

- Add focused unit tests for:
  - Import validation/mapping and idempotency.
  - Compatibility predicates.
  - PC build selection.
  - Coupon rule matching.
  - Best-offer selection.
  - Discount caps, dates, usage limits, and quote math.
- Add route/integration tests for:
  - Gaming search filters.
  - Full/partial builder gating.
  - Explicit bulk-cart confirmation.
  - Coupon application/removal.
  - Race-safe checkout redemption.
  - Order snapshot persistence.
- Add UI tests for Gaming navigation, PDP specs/gallery, chatbot conversation/confirmation, coupon errors, and cart/checkout total agreement.
- Update `ARCHITECTURE.md` and user-facing documentation with:
  - Data-import procedure.
  - Required compatibility fields.
  - Promotion-rule semantics.
  - Admin/seed lifecycle.
  - The second catalog export dependency.

## Relevant Files

- `pc_components_shopnow.json`: source data for the first idempotent Gaming catalog import.
- `lib/db/src/schema/products.ts`: catalog hierarchy, imported-source identity, images, structured specifications.
- `lib/db/src/seed.ts`: local coupon/catalog fixtures only; do not turn the full import into a hand-authored seed array.
- `artifacts/api-server/src/routes/products.ts`: hierarchical Gaming filters and category metadata.
- `artifacts/shopnow/src/pages/CategoryPage.tsx`: Gaming/component browsing.
- `artifacts/shopnow/src/pages/PDPPage.tsx`: structured PC specs and gallery.
- `artifacts/api-server/src/agents/bundle-advisor-agent.ts`: multi-turn brief collection pattern.
- `artifacts/api-server/src/agents/clarification-policy.ts`: incomplete user requirement/history pattern.
- `artifacts/api-server/src/agents/router-agent.ts` and `agent-graph.ts`: `gaming_build` and coupon intent registration.
- `artifacts/api-server/src/agents/add-to-cart-agent.ts`: explicit multi-product cart semantics.
- `artifacts/shopnow/src/components/AIChatbot.tsx`: typed build card, confirmation, and coupon quote.
- `lib/db/src/schema/orders.ts`: order monetary and coupon snapshots.
- `lib/db/src/schema/coupons.ts`, `coupon-rules.ts`, and `coupon-redemptions.ts`: promotion data model.
- `artifacts/api-server/src/routes/cart.ts`: replace hardcoded `TECH20` pricing.
- `artifacts/api-server/src/routes/checkout.ts`: transactional quote, coupon redemption, corrected order total.
- `lib/api-spec/openapi.yaml`: contract source for filters, build/cart actions, and coupon APIs.

## Verification

1. Run the database migration against a disposable/local database, import `pc_components_shopnow.json` twice, and assert 101 Gaming products with no duplicate `externalId` values, preserved price/stock/spec/image data, and correct component types.
2. Test category/product APIs for current categories and Gaming with each component type, confirming existing storefront queries remain unchanged and nested filters return correct inventory.
3. Use fixture catalogs to test compatibility acceptance/rejection for socket, RAM generation, form factor, GPU/cooler clearance, storage interface, and PSU wattage/connectors. Confirm full-build output remains blocked until the second export is present.
4. Exercise chatbot flows with Gemini disabled: users provide build inputs across turns, receive exactly one recommendation, see a coupon quote, and must confirm before cart mutation. Test reload/session recovery and stale/ineligible selections.
5. Test coupon rules for category/component/product eligibility, percent/fixed values, caps, minimum spend, time windows, global/per-user usage limits, invalid codes, auto-apply best offer, and manual-code precedence.
6. Run concurrent checkout tests against a max-use-one coupon; exactly one order may redeem it. Confirm the cart quote, checkout charge, order monetary fields, coupon snapshot, and redemption record agree.
7. Regenerate OpenAPI/Zod/React client code, run each workspace typecheck/build, and perform responsive browser checks for Gaming browse/PDP, build confirmation, cart coupon UI, and checkout total.
