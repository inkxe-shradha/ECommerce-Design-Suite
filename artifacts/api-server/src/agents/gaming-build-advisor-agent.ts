/**
 * gaming-build-advisor-agent.ts
 *
 * Multi-turn chatbot agent that guides users through a gaming PC build brief,
 * calls the deterministic pc-builder service, shows the result with a coupon
 * quote, and requests one explicit confirmation before bulk-adding to cart.
 *
 * Conversation flow:
 *   1. Detect intent (budget, workload, display, streaming, brands)
 *   2. Ask one clarifying question per missing required field
 *   3. Once brief is complete → call buildGamingPc()
 *   4. Present result with compatibility note and coupon savings
 *   5. Wait for explicit "yes, add to cart" confirmation
 *   6. Return product list with add-to-cart capability
 */

import { db, cartItemsTable, productsTable } from '@workspace/db';
import { and, eq } from 'drizzle-orm';
import { buildGamingPc } from '../services/pc-builder.js';
import type { BuildBrief } from '../services/pc-builder.js';
import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

// ─── Stockpile brand discovery helpers ──────────────────────────────────────

async function getInStockBrandsForComponent(
  componentType: string,
): Promise<string[]> {
  const rows = await db
    .select({ brand: productsTable.brand })
    .from(productsTable)
    .where(
      and(
        eq(productsTable.department, 'Gaming'),
        eq(productsTable.componentType, componentType),
        eq(productsTable.inStock, true),
      ),
    );

  const brandSet = new Set<string>();
  for (const r of rows) {
    if (r.brand && r.brand.trim()) brandSet.add(r.brand.trim());
  }
  return Array.from(brandSet).sort();
}

function detectRequestedComponentType(text: string): string | null {
  const t = text.toLowerCase();
  if (
    /gpu|graphics card|card|5090|4090|4080|4070|7900|7800|radeon|geforce|rtx|gtx/.test(
      t,
    )
  ) {
    return 'Graphics Card';
  }
  if (
    /cpu|processor|ryzen|intel|threadripper|i7|i9|i5|i3|7800x3d|14900k/.test(t)
  ) {
    return 'Processor';
  }
  if (/motherboard|mb|board|b650|z790|b760|x670/.test(t)) {
    return 'Motherboard';
  }
  if (/case|cabinet|tower|chassis|lian li|nzxt|fractal/.test(t)) {
    return 'Case';
  }
  if (/cooler|liquid|aio|air cooler|fan/.test(t)) {
    return 'CPU Cooler';
  }
  if (/ram|memory|ddr4|ddr5/.test(t)) {
    return 'RAM';
  }
  if (/storage|ssd|nvme|hdd/.test(t)) {
    return 'Storage';
  }
  if (/psu|power supply|smps|watt/.test(t)) {
    return 'Power Supply';
  }
  return null;
}

// ─── Brief extraction helpers ─────────────────────────────────────────────────

function extractBudget(text: string): number | null {
  const match = text.match(
    /(?:budget|spend|cost|₹|rs\.?|inr)?\s*([\d,]+(?:\.\d+)?)\s*(k|lakh|lakhs|lac|lacs|l)?/i,
  );
  if (!match) return null;
  const rawNum = match[1].replace(/,/g, '');
  let amount = parseFloat(rawNum);
  if (isNaN(amount) || amount <= 0) return null;

  const suffix = (match[2] ?? '').toLowerCase();
  if (suffix === 'k') {
    amount *= 1000;
  } else if (['lakh', 'lakhs', 'lac', 'lacs', 'l'].includes(suffix)) {
    amount *= 100000;
  } else if (amount > 0 && amount <= 15) {
    amount *= 100000;
  } else if (amount > 15 && amount <= 500 && !rawNum.includes('.')) {
    amount *= 1000;
  }

  return amount >= 10000 ? Math.round(amount) : null;
}

function extractWorkload(text: string): BuildBrief['workload'] | null {
  const t = text.toLowerCase();
  if (/stream|broadcast|obs/.test(t)) return 'streaming';
  if (/creat|video edit|render|3d|blender|premiere/.test(t)) return 'creator';
  if (/workstation|cad|simulation|professional/.test(t)) return 'workstation';
  if (/game|gaming|play|fps|esport/.test(t)) return 'gaming';
  return null;
}

function extractDisplay(text: string): BuildBrief['targetDisplay'] | null {
  const t = text.toLowerCase();
  if (/4k|2160/.test(t)) return '4k60';
  if (/1440|2k|wqhd/.test(t)) {
    if (/144|165|180|240/.test(t)) return '1440p144';
    return '1440p144';
  }
  if (/1080|fhd|full.?hd/.test(t)) {
    if (/144|165|180|240/.test(t)) return '1080p144';
    return '1080p60';
  }
  return null;
}

function extractCpuBrand(text: string): 'AMD' | 'Intel' | null {
  if (/\bamd\b|ryzen/.test(text.toLowerCase())) return 'AMD';
  if (/\bintel\b|core\s*i[3579]/.test(text.toLowerCase())) return 'Intel';
  return null;
}

function extractGpuBrand(text: string): 'AMD' | 'Nvidia' | null {
  if (/\bamd\b|radeon/.test(text.toLowerCase())) return 'AMD';
  if (/nvidia|geforce|rtx|gtx/.test(text.toLowerCase())) return 'Nvidia';
  return null;
}

// ─── Confirmation detection ───────────────────────────────────────────────────

function isConfirmation(text: string): boolean {
  const t = text.toLowerCase().trim();
  return (
    t.includes('yes') ||
    t.includes('add') ||
    t.includes('confirm') ||
    t.includes('go ahead') ||
    t.includes('do it') ||
    t.includes('proceed') ||
    t === 'ok' ||
    t === 'okay' ||
    t === 'sure' ||
    t === 'yep' ||
    t === 'yup'
  );
}

// ─── Build brief from conversation history ────────────────────────────────────

interface PartialBrief {
  budget?: number;
  workload?: BuildBrief['workload'];
  targetDisplay?: BuildBrief['targetDisplay'];
  needsStreaming?: boolean;
  cpuBrand?: 'AMD' | 'Intel' | null;
  gpuBrand?: 'AMD' | 'Nvidia' | null;
}

function extractBriefFromHistory(
  history: Array<{ role: string; content: string }>,
  currentMessage: string,
): PartialBrief {
  const userMessages = history
    .filter((h) => h.role === 'user')
    .map((h) => h.content);
  const allUserMessages = [...userMessages, currentMessage];

  const brief: PartialBrief = {};

  // Extract budget from newest to oldest
  for (let i = allUserMessages.length - 1; i >= 0; i--) {
    const budget = extractBudget(allUserMessages[i]);
    if (budget) {
      brief.budget = budget;
      break;
    }
  }

  // Handle budget modifiers in latest message
  const lowerMsg = currentMessage.toLowerCase();
  if (brief.budget) {
    if (
      lowerMsg.includes('cheaper build') ||
      lowerMsg.includes('lower budget') ||
      lowerMsg.includes('less expensive')
    ) {
      brief.budget = Math.max(40000, Math.round((brief.budget * 0.8) / 5000) * 5000);
    } else if (
      lowerMsg.includes('upgrade build') ||
      lowerMsg.includes('higher budget') ||
      lowerMsg.includes('better build')
    ) {
      brief.budget = Math.round((brief.budget * 1.25) / 5000) * 5000;
    }
  }

  // Extract brand preferences (newest user messages take precedence)
  for (let i = allUserMessages.length - 1; i >= 0; i--) {
    const msg = allUserMessages[i];
    if (!brief.cpuBrand) {
      const cpu = extractCpuBrand(msg);
      if (cpu) brief.cpuBrand = cpu;
    }
    if (!brief.gpuBrand) {
      const gpu = extractGpuBrand(msg);
      if (gpu) brief.gpuBrand = gpu;
    }
  }

  // Handle explicit swap GPU command if no brand specified
  if (
    lowerMsg.includes('swap gpu') ||
    lowerMsg.includes('change gpu') ||
    lowerMsg.includes('swap the gpu')
  ) {
    if (
      !lowerMsg.includes('nvidia') &&
      !lowerMsg.includes('amd') &&
      !lowerMsg.includes('radeon') &&
      !lowerMsg.includes('geforce') &&
      !lowerMsg.includes('rtx')
    ) {
      brief.gpuBrand = brief.gpuBrand === 'Nvidia' ? 'AMD' : 'Nvidia';
    }
  }

  // Handle explicit swap CPU command if no brand specified
  if (
    lowerMsg.includes('swap cpu') ||
    lowerMsg.includes('change cpu') ||
    lowerMsg.includes('swap the cpu')
  ) {
    if (
      !lowerMsg.includes('intel') &&
      !lowerMsg.includes('amd') &&
      !lowerMsg.includes('ryzen')
    ) {
      brief.cpuBrand = brief.cpuBrand === 'Intel' ? 'AMD' : 'Intel';
    }
  }

  const combined = allUserMessages.join(' ');
  const workload = extractWorkload(combined);
  if (workload) brief.workload = workload;

  const display = extractDisplay(combined);
  if (display) brief.targetDisplay = display;

  if (/stream|broadcast/i.test(combined)) brief.needsStreaming = true;

  return brief;
}

// ─── Agent ────────────────────────────────────────────────────────────────────

export class GamingBuildAdvisorAgent implements Agent {
  name = 'GamingBuildAdvisorAgent';

  async execute(
    ctx: AgentContext,
    _parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { message, userId, history = [] } = ctx;
    const lowerMsg = message.toLowerCase();

    // ── Extract brief from conversation history ────────────────────────────
    const brief = extractBriefFromHistory(history, message);

    // ── Check for specific brand or component request ─────────────────────
    const targetComp = detectRequestedComponentType(message);
    const isBrandQuery =
      lowerMsg.includes('add') ||
      lowerMsg.includes('want') ||
      lowerMsg.includes('brand') ||
      lowerMsg.includes('5090') ||
      lowerMsg.includes('4090') ||
      lowerMsg.includes('4070') ||
      lowerMsg.includes('asus') ||
      lowerMsg.includes('msi') ||
      lowerMsg.includes('gigabyte') ||
      lowerMsg.includes('zotac') ||
      lowerMsg.includes('corsair') ||
      lowerMsg.includes('lian li');

    if (
      targetComp &&
      brief.budget &&
      isBrandQuery &&
      !isConfirmation(message) &&
      !lowerMsg.includes('coupon')
    ) {
      const inStockBrands = await getInStockBrandsForComponent(targetComp);

      const requestedBrandMatch = inStockBrands.find((b) =>
        lowerMsg.includes(b.toLowerCase()),
      );

      const is5090 = lowerMsg.includes('5090');

      if (is5090) {
        const brandListFormatted = inStockBrands
          .slice(0, 6)
          .map((b) => `- **${b}**`)
          .join('\n');
        const chipOptions = inStockBrands.slice(0, 4);

        return {
          reply:
            `⚠️ We don't currently have the **NVIDIA RTX 5090** in stock yet.\n\n` +
            `Here are the available in-stock brands for **${targetComp}s** in our catalog:\n\n` +
            `${brandListFormatted}\n\n` +
            `Which brand would you like to select for your build?`,
          products: [],
          orders: [],
          followUp: chipOptions,
          userContext: null,
        };
      }

      if (
        (lowerMsg.includes('add') || lowerMsg.includes('which brand')) &&
        !requestedBrandMatch &&
        inStockBrands.length > 0
      ) {
        const brandListFormatted = inStockBrands
          .slice(0, 6)
          .map((b) => `- **${b}**`)
          .join('\n');
        const chipOptions = inStockBrands.slice(0, 4);

        return {
          reply:
            `Which brand would you prefer for your **${targetComp}**? Here are the available in-stock brands in our catalog:\n\n` +
            `${brandListFormatted}\n\n` +
            `Tap a brand below or reply with your preferred brand!`,
          products: [],
          orders: [],
          followUp: chipOptions,
          userContext: null,
        };
      }

      if (requestedBrandMatch) {
        if (targetComp === 'Graphics Card') {
          brief.gpuBrand =
            requestedBrandMatch.toLowerCase().includes('nvidia') ||
            requestedBrandMatch.toLowerCase().includes('asus') ||
            requestedBrandMatch.toLowerCase().includes('msi') ||
            requestedBrandMatch.toLowerCase().includes('zotac') ||
            requestedBrandMatch.toLowerCase().includes('gigabyte')
              ? 'Nvidia'
              : 'AMD';
        } else if (targetComp === 'Processor') {
          brief.cpuBrand = requestedBrandMatch.toLowerCase().includes('intel')
            ? 'Intel'
            : 'AMD';
        }
      }
    }

    // ── Check for coupon queries while in build flow ───────────────────────
    const isCouponRequest =
      lowerMsg.includes('coupon') ||
      lowerMsg.includes('promo') ||
      lowerMsg.includes('discount') ||
      lowerMsg.includes('save with') ||
      lowerMsg.includes('code');

    if (isCouponRequest && brief.budget) {
      try {
        const result = await buildGamingPc({
          budget: brief.budget,
          workload: brief.workload ?? 'gaming',
          targetDisplay: brief.targetDisplay ?? '1440p144',
          needsStreaming: brief.needsStreaming ?? false,
          includePeripherals: false,
          cpuBrand: brief.cpuBrand ?? null,
          gpuBrand: brief.gpuBrand ?? null,
        });

        const total = result.totalPrice;
        const build50kPrice = total >= 50000 ? total - 5000 : total;
        const gaming10Discount = Math.round(total * 0.1);
        const gaming10Price = total - gaming10Discount;

        let reply = `## 🏷️ Coupon & Promo Savings for Your PC Build\n\n`;
        reply += `Your current PC build total is **₹${total.toLocaleString('en-IN')}**.\n\n`;
        reply += `Here are the best promo codes you can use:\n\n`;
        reply += `1. 🎟️ **\`BUILD50K\`** — **Flat ₹5,000 OFF** (for carts over ₹50,000)\n`;
        reply += `   - **Discounted Price:** ~**₹${build50kPrice.toLocaleString('en-IN')}**\n\n`;
        reply += `2. 🎮 **\`GAMING10\`** — **10% OFF** Gaming Department\n`;
        reply += `   - **Discounted Price:** ~**₹${gaming10Price.toLocaleString('en-IN')}** (Save ₹${gaming10Discount.toLocaleString('en-IN')})\n\n`;
        reply += `3. ⚡ **\`CPU15\`** — **15% OFF** Processors | 🎮 **\`GPU5K\`** — **₹5,000 OFF** GPUs\n\n`;
        reply += `---\n✅ **Ready to add all ${result.components.length} components to your cart with coupon support?** Type **"Yes, add to cart"** or select a swap option below.`;

        return {
          reply,
          products: result.components.map((c) => c.product),
          orders: [],
          followUp: [
            'Yes, add to cart',
            brief.gpuBrand === 'Nvidia' ? 'Swap GPU to AMD' : 'Swap GPU to Nvidia',
            brief.cpuBrand === 'Intel' ? 'Swap CPU to AMD' : 'Swap CPU to Intel',
            'Show cheaper build',
          ],
          userContext: ctx.userContext
            ? {
                name: ctx.userContext.name,
                recentOrderCount: ctx.userContext.recentOrders?.length ?? 0,
                interests: ctx.userContext.interests,
              }
            : null,
        };
      } catch (err) {
        console.error('Coupon query in gaming build failed:', err);
      }
    }

    // ── Check if user is confirming a previously presented build ──────────
    const lastAssistantMsg = [...history]
      .reverse()
      .find((h) => h.role === 'assistant');
    const lastContentLower = (lastAssistantMsg?.content || '').toLowerCase();
    const isAwaitingConfirmation =
      lastContentLower.includes('ready to add') ||
      lastContentLower.includes('add all') ||
      lastContentLower.includes('confirm your build');

    if (isAwaitingConfirmation && isConfirmation(message)) {
      return this.confirmAndAddToCart(ctx, history);
    }

    // ── Ask for missing required fields one at a time ──────────────────────
    if (!brief.budget) {
      return this.askQuestion(
        "🎮 Let's build your perfect gaming PC! What's your **total budget** in INR? (e.g. ₹80,000, 1.5 lakh, or 2.5 lakh)",
        ctx,
        ['₹80,000', '1.5 lakh', '2.5 lakh'],
      );
    }

    if (!brief.workload) {
      brief.workload = 'gaming';
    }

    if (!brief.targetDisplay) {
      if (brief.budget >= 200000) {
        brief.targetDisplay = '4k60';
      } else if (brief.budget >= 100000) {
        brief.targetDisplay = '1440p144';
      } else {
        brief.targetDisplay = '1080p144';
      }
    }

    // ── Brief is complete — run the builder ───────────────────────────────
    try {
      const result = await buildGamingPc({
        budget: brief.budget,
        workload: brief.workload,
        targetDisplay: brief.targetDisplay,
        needsStreaming: brief.needsStreaming ?? false,
        includePeripherals: false,
        cpuBrand: brief.cpuBrand ?? null,
        gpuBrand: brief.gpuBrand ?? null,
      });

      const products = result.components.map((c) => c.product);
      const totalFormatted = `₹${result.totalPrice.toLocaleString('en-IN')}`;
      const budgetRemaining =
        result.budgetRemaining > 0
          ? `₹${result.budgetRemaining.toLocaleString('en-IN')} under budget`
          : 'at budget';

      let reply = `## 🖥️ Your ${brief.workload} PC Build — ${totalFormatted} (${budgetRemaining})\n\n`;

      if (result.partialNote) {
        reply += `> ${result.partialNote}\n\n`;
      }

      if (result.compatibilityErrors.length > 0) {
        reply += `**⚠️ Compatibility notes:**\n${result.compatibilityErrors.map((e) => `- ${e}`).join('\n')}\n\n`;
      }

      reply += `**Components selected:**\n`;
      for (const c of result.components) {
        reply += `- **${c.componentKey.replace(/([A-Z])/g, ' $1').trim()}**: ${c.product.name} — ₹${Number(c.product.price).toLocaleString('en-IN')}\n  _${c.reason}_\n`;
      }

      reply += `\n**Estimated power draw:** ~${result.estimatedPowerDraw}W\n`;
      reply += `\n🏷️ **Coupon Savings Available**: Code **\`BUILD50K\`** saves **₹5,000** off (or **\`GAMING10\`** for 10% off)!`;

      reply += `\n\n🔄 **Customize & Swap Options:**\n`;
      reply += `- Type **"Swap GPU to Nvidia"** or **"Swap GPU to AMD"**\n`;
      reply += `- Type **"Swap CPU to Intel"** or **"Swap CPU to AMD"**\n`;
      reply += `- Type **"Show cheaper build"** for lower budget\n`;

      reply += `\n---\n✅ **Ready to add all ${result.components.length} components to your cart?** Type **"Yes, add to cart"** to confirm, or tap a swap option below.`;

      return {
        reply,
        products,
        orders: [],
        followUp: [
          'Yes, add to cart',
          brief.gpuBrand === 'Nvidia' ? 'Swap GPU to AMD' : 'Swap GPU to Nvidia',
          brief.cpuBrand === 'Intel' ? 'Swap CPU to AMD' : 'Swap CPU to Intel',
          'Can I save with a coupon?',
          'Show cheaper build',
        ],
        userContext: ctx.userContext
          ? {
              name: ctx.userContext.name,
              recentOrderCount: ctx.userContext.recentOrders?.length ?? 0,
              interests: ctx.userContext.interests,
            }
          : null,
      };
    } catch (err) {
      console.error('GamingBuildAdvisorAgent error:', err);
      return {
        reply:
          'I ran into an issue while building your PC config. Please try again or browse Gaming components directly.',
        products: [],
        orders: [],
        userContext: null,
      };
    }
  }

  private askQuestion(
    question: string,
    ctx: AgentContext,
    followUp: string[] = [],
  ): AgentResponse {
    return {
      reply: question,
      products: [],
      orders: [],
      followUp,
      userContext: ctx.userContext
        ? {
            name: ctx.userContext.name,
            recentOrderCount: ctx.userContext.recentOrders?.length ?? 0,
            interests: ctx.userContext.interests,
          }
        : null,
    };
  }

  private async confirmAndAddToCart(
    ctx: AgentContext,
    history: Array<{ role: string; content: string }>,
  ): Promise<AgentResponse> {
    // Re-extract the brief from history to re-run the build
    const brief = extractBriefFromHistory(history, ctx.message);

    if (brief.budget) {
      if (!brief.workload) brief.workload = 'gaming';
      if (!brief.targetDisplay) {
        if (brief.budget >= 200000) {
          brief.targetDisplay = '4k60';
        } else if (brief.budget >= 100000) {
          brief.targetDisplay = '1440p144';
        } else {
          brief.targetDisplay = '1080p144';
        }
      }
    }

    if (!brief.budget) {
      return {
        reply:
          'I lost track of your build budget. Could you briefly tell me your target budget in INR again?',
        products: [],
        orders: [],
        userContext: null,
      };
    }

    try {
      const result = await buildGamingPc({
        budget: brief.budget,
        workload: brief.workload ?? 'gaming',
        targetDisplay: brief.targetDisplay ?? '1440p144',
        needsStreaming: brief.needsStreaming ?? false,
        includePeripherals: false,
        cpuBrand: brief.cpuBrand ?? null,
        gpuBrand: brief.gpuBrand ?? null,
      });

      // Add items to cart (for logged-in user or default session)
      const sessionId = ctx.userId ? `user_${ctx.userId}` : 'default';
      for (const c of result.components) {
        const productId = c.product.id;
        await db
          .insert(cartItemsTable)
          .values({ sessionId, productId, quantity: 1 })
          .onConflictDoNothing();
      }

      return {
        reply:
          `🎉 **Success! All ${result.components.length} gaming components have been added to your cart!**\n\n` +
          `**Build Summary:**\n` +
          `${result.components.map((c) => `- **${c.componentKey.toUpperCase()}**: ${c.product.name} — ₹${Number(c.product.price).toLocaleString('en-IN')}`).join('\n')}\n\n` +
          `**Total Build Price:** **₹${result.totalPrice.toLocaleString('en-IN')}**\n\n` +
          `💡 *Tip: Remember to apply promo code **\`BUILD50K\`** (₹5,000 off) or **\`GAMING10\`** (10% off) at checkout!*`,
        products: result.components.map((c) => c.product),
        orders: [],
        followUp: ['Go to cart', 'Apply a coupon', 'View order history'],
        userContext: ctx.userContext
          ? {
              name: ctx.userContext.name,
              recentOrderCount: ctx.userContext.recentOrders?.length ?? 0,
              interests: ctx.userContext.interests,
            }
          : null,
      };
    } catch (err) {
      console.error('GamingBuildAdvisorAgent confirm error:', err);
      return {
        reply: 'Something went wrong while adding to cart. Please try again.',
        products: [],
        orders: [],
        userContext: null,
      };
    }
  }
}
