import type { AgentContext, ParsedIntent, UserContext } from './types.js';
import { getAIProvider, type StructuredSchema } from './ai-provider.js';

const GREETINGS = [
  'hi',
  'hello',
  'hey',
  'good morning',
  'good evening',
  'good afternoon',
  'howdy',
  'hola',
  'sup',
];

const BRANDS: Array<{ name: string; category?: string }> = [
  { name: 'Samsung', category: 'Mobiles' },
  { name: 'Xiaomi', category: 'Mobiles' },
  { name: 'OnePlus', category: 'Mobiles' },
  { name: 'Motorola', category: 'Mobiles' },
  { name: 'Vivo', category: 'Mobiles' },
  { name: 'Oppo', category: 'Mobiles' },
  { name: 'Realme', category: 'Mobiles' },
  { name: 'Redmi', category: 'Mobiles' },
  { name: 'Apple' },
  { name: 'Sony' },
  { name: 'Dell', category: 'Laptops' },
  { name: 'HP', category: 'Laptops' },
  { name: 'Lenovo', category: 'Laptops' },
  { name: 'Asus', category: 'Laptops' },
];

const INTENT_SCHEMA: StructuredSchema = {
  type: 'object',
  properties: {
    isGreeting: { type: 'boolean' },
    intent: { type: 'string' },
    category: { type: 'string', nullable: true },
    maxPrice: { type: 'number', nullable: true },
    minPrice: { type: 'number', nullable: true },
    keyword: { type: 'string', nullable: true },
    brands: {
      type: 'array',
      items: { type: 'string' },
      nullable: true,
    },
    sortByPrice: {
      type: 'string',
      nullable: true,
      description: '"asc" or "desc"',
    },
    sortByRating: {
      type: 'boolean',
      nullable: true,
      description: 'true when user wants best/top rated products',
    },
    reply: { type: 'string', description: 'Conversational reply' },
  },
};

function localFallbackParse(
  message: string,
  history?: Array<{ role: string; content: string }>,
): ParsedIntent {
  const lower = message.trim().toLowerCase();

  const isGreeting = GREETINGS.some(
    (g) =>
      lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'),
  );
  if (isGreeting) {
    return { isGreeting: true, intent: 'greeting', reply: '' };
  }

  // Active Gaming PC build continuation
  const lastAssistantMsg = [...(history || [])]
    .reverse()
    .find((h) => h.role === 'assistant');
  const lastContentLower = (lastAssistantMsg?.content || '').toLowerCase();
  const isGamingBuildActive =
    lastContentLower.includes('gaming pc') ||
    lastContentLower.includes('pc build') ||
    lastContentLower.includes('total budget') ||
    lastContentLower.includes('display target') ||
    lastContentLower.includes('primary use case') ||
    lastContentLower.includes('components selected') ||
    lastContentLower.includes('ready to add') ||
    lastContentLower.includes('coupon savings');

  if (isGamingBuildActive) {
    return { isGreeting: false, intent: 'gaming_build', reply: '' };
  }

  if (
    lower.includes('add') &&
    (lower.includes('cart') || lower.includes('all to cart'))
  ) {
    return { isGreeting: false, intent: 'add_to_cart', reply: '' };
  }
  if (
    lower.includes('add all') ||
    lower.includes('add everything') ||
    lower.includes('add bundle')
  ) {
    return { isGreeting: false, intent: 'add_to_cart', reply: '' };
  }

  // Gaming PC build intent — checked before generic bundle triggers
  const gamingBuildTriggers = [
    'build gaming pc',
    'build a gaming pc',
    'build pc',
    'build a pc',
    'gaming rig',
    'gaming build',
    'pc build',
    'pc builder',
    'build my pc',
    'build gaming rig',
    'assemble pc',
    'help me build',
    'recommend gaming pc',
    'gaming computer build',
    'compatible parts',
    'what processor',
    'which gpu',
    'which cpu',
  ];
  if (gamingBuildTriggers.some((t) => lower.includes(t))) {
    return { isGreeting: false, intent: 'gaming_build', reply: '' };
  }

  // Coupon intent
  if (
    lower.includes('coupon') ||
    lower.includes('promo code') ||
    lower.includes('discount code') ||
    lower.includes('apply code') ||
    lower.includes('voucher') ||
    lower.includes('offer code')
  ) {
    return {
      isGreeting: false,
      intent: 'product_search',
      category: undefined,
      reply: '',
    };
  }

  const bundleTriggers = [
    'student',
    'college',
    'university',
    'engineering',
    'gamer',
    'gaming setup',
    'gaming',
    'work from home',
    'professional',
    'office setup',
    'office',
    'content creator',
    'youtuber',
    'vlogger',
    'creator',
    'doctor',
    'medical',
    'nurse',
    'healthcare',
    'teacher',
    'professor',
    'educator',
    'architect',
    'designer',
    'musician',
    'music production',
    'photographer',
    'photography',
    'freelancer',
    'freelance',
    'remote work',
  ];
  const hasBundlePersona = bundleTriggers.some((t) => lower.includes(t));
  const hasBundleIntent =
    lower.includes('good for me') ||
    lower.includes('bundle') ||
    lower.includes('setup for') ||
    lower.includes('what should i') ||
    lower.includes('suggest for') ||
    lower.includes('help me pick') ||
    lower.includes('complete setup') ||
    lower.includes('everything i need');
  if (
    hasBundlePersona &&
    (hasBundleIntent || lower.includes('want to buy') || lower.includes('need'))
  ) {
    return { isGreeting: false, intent: 'bundle_advisor', reply: '' };
  }
  if (
    hasBundlePersona &&
    (lower.includes('good') ||
      lower.includes('best') ||
      lower.includes('recommend'))
  ) {
    return { isGreeting: false, intent: 'bundle_advisor', reply: '' };
  }
  if (hasBundlePersona) {
    return { isGreeting: false, intent: 'bundle_advisor', reply: '' };
  }

  const hasRatingIntent =
    lower.includes('best rat') ||
    lower.includes('top rat') ||
    lower.includes('highest rat') ||
    lower.includes('best review') ||
    lower.includes('top review') ||
    lower.includes('most rated') ||
    lower.includes('highly rated');
  if (hasRatingIntent) {
    let ratingCategory: string | undefined;
    if (
      lower.includes('mobile') ||
      lower.includes('phone') ||
      lower.includes('iphone')
    )
      ratingCategory = 'Mobiles';
    else if (lower.includes('laptop') || lower.includes('macbook'))
      ratingCategory = 'Laptops';
    else if (
      lower.includes('headphone') ||
      lower.includes('audio') ||
      lower.includes('earbud') ||
      lower.includes('speaker')
    )
      ratingCategory = 'Audio';
    else if (lower.includes('camera')) ratingCategory = 'Cameras';
    else if (
      lower.includes('accessor') ||
      lower.includes('mouse') ||
      lower.includes('keyboard')
    )
      ratingCategory = 'Accessories';

    return {
      isGreeting: false,
      intent: 'product_search',
      category: ratingCategory,
      sortByPrice: undefined,
      sortByRating: true,
      reply: '',
    } as ParsedIntent;
  }

  const hasPopularIntent =
    lower.includes('popular') ||
    lower.includes('trending') ||
    lower.includes("what's hot") ||
    lower.includes('whats hot') ||
    lower.includes('bestseller') ||
    lower.includes('best seller') ||
    lower.includes('trending now') ||
    lower.includes('most popular') ||
    lower.includes('most reviewed') ||
    lower.includes('what should i buy') ||
    (lower.includes('what') && lower.includes('popular'));
  if (hasPopularIntent) {
    return { isGreeting: false, intent: 'popular_products', reply: '' };
  }

  if (
    lower.includes('top pick') ||
    lower.includes('best for me') ||
    lower.includes('recommend') ||
    lower.includes('suggestion') ||
    lower.includes('something new')
  ) {
    return { isGreeting: false, intent: 'top_picks', reply: '' };
  }

  if (
    lower.includes('order') ||
    lower.includes('purchase') ||
    lower.includes('bought')
  ) {
    return { isGreeting: false, intent: 'orders', reply: '' };
  }

  if (
    lower.includes('address') ||
    lower.includes('delivery') ||
    lower.includes('shipping')
  ) {
    return { isGreeting: false, intent: 'address', reply: '' };
  }

  let category: string | undefined;
  if (
    lower.includes('mobile') ||
    lower.includes('phone') ||
    lower.includes('iphone') ||
    lower.includes('galaxy') ||
    lower.includes('pixel')
  ) {
    category = 'Mobiles';
  } else if (
    lower.includes('laptop') ||
    lower.includes('macbook') ||
    lower.includes('dell') ||
    lower.includes('hp')
  ) {
    category = 'Laptops';
  } else if (
    lower.includes('headphone') ||
    lower.includes('airpod') ||
    lower.includes('audio') ||
    lower.includes('earbud') ||
    lower.includes('speaker')
  ) {
    category = 'Audio';
  } else if (
    lower.includes('camera') ||
    lower.includes('sony') ||
    lower.includes('canon') ||
    lower.includes('nikon')
  ) {
    category = 'Cameras';
  } else if (
    lower.includes('accessory') ||
    lower.includes('mouse') ||
    lower.includes('keyboard') ||
    lower.includes('power bank')
  ) {
    category = 'Accessories';
  }

  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  let sortByPrice: 'asc' | 'desc' | undefined;
  let brands: string[] | undefined = BRANDS.filter((brand) =>
    new RegExp(`\\b${brand.name.toLowerCase()}\\b`).test(lower),
  ).map((brand) => brand.name);
  if (brands.length === 0) brands = undefined;

  if (!category && brands?.length === 1) {
    category = BRANDS.find((brand) => brand.name === brands?.[0])?.category;
  }

  if (
    lower.includes('premium') ||
    lower.includes('flagship') ||
    lower.includes('high end') ||
    lower.includes('high-end') ||
    lower.includes('luxury') ||
    lower.includes('top of the line') ||
    lower.includes('best') ||
    lower.includes('expensive')
  ) {
    if (category === 'Mobiles') {
      minPrice = 60000;
      brands = ['Apple', 'Samsung', 'Google'];
    } else if (category === 'Laptops') {
      minPrice = 80000;
      brands = ['Apple', 'Dell', 'HP'];
    } else if (category === 'Audio') {
      minPrice = 15000;
      brands = ['Sony', 'Apple', 'Bose'];
    } else if (category === 'Cameras') {
      minPrice = 50000;
    } else {
      minPrice = 30000;
    }
    sortByPrice = 'desc';
  } else if (
    lower.includes('budget') ||
    lower.includes('cheap') ||
    lower.includes('affordable') ||
    lower.includes('value for money') ||
    lower.includes('low price') ||
    lower.includes('economical') ||
    lower.includes('inexpensive')
  ) {
    if (category === 'Mobiles') {
      maxPrice = 25000;
    } else if (category === 'Laptops') {
      maxPrice = 50000;
    } else if (category === 'Audio') {
      maxPrice = 5000;
    } else if (category === 'Cameras') {
      maxPrice = 30000;
    } else {
      maxPrice = 15000;
    }
    sortByPrice = 'asc';
  } else if (
    lower.includes('mid range') ||
    lower.includes('mid-range') ||
    lower.includes('midrange') ||
    lower.includes('moderate')
  ) {
    if (category === 'Mobiles') {
      minPrice = 25000;
      maxPrice = 60000;
    } else if (category === 'Laptops') {
      minPrice = 50000;
      maxPrice = 80000;
    } else if (category === 'Audio') {
      minPrice = 5000;
      maxPrice = 15000;
    } else {
      minPrice = 15000;
      maxPrice = 40000;
    }
  }

  const matchK = lower.match(/(?:under|below|less than|\<)\s*(\d+)\s*k/);
  if (matchK) {
    maxPrice = parseInt(matchK[1], 10) * 1000;
  } else {
    const matchNum = lower.match(
      /(?:under|below|less than|\<)\s*₹?\s*([\d,]+)/,
    );
    if (matchNum) {
      maxPrice = parseInt(matchNum[1].replace(/,/g, ''), 10);
    }
  }

  const matchAbove = lower.match(
    /(?:above|over|more than|starting|from)\s*₹?\s*([\d,]+)\s*k?/,
  );
  if (matchAbove) {
    const val = parseInt(matchAbove[1].replace(/,/g, ''), 10);
    minPrice = matchAbove[0].includes('k') ? val * 1000 : val;
  }

  let keyword: string | undefined;
  const keywordPatterns = [
    /(?:galaxy\s*)(s\d+[\w\s]*(?:ultra|plus|fe)?)/i,
    /(?:iphone\s*)(\d+[\w\s]*(?:pro|max|plus)?)/i,
    /(?:pixel\s*)(\d+[\w\s]*(?:pro|a)?)/i,
    /(?:macbook\s*)(air|pro[\w\s]*(?:m\d)?)/i,
    /(?:redmi|poco|oneplus|realme|vivo|oppo)\s+([\w\d]+[\w\s]*)/i,
  ];

  for (const pattern of keywordPatterns) {
    const match = lower.match(pattern);
    if (match) {
      keyword = match[0].trim();
      break;
    }
  }

  if (!keyword) {
    const intentMatch = lower.match(
      /(?:show me|find|search|looking for|i want|buy|get me|need)\s+(?:a |an |some |the )?(.+?)(?:\s+under|\s+below|\s+above|\s+from|$)/,
    );
    if (intentMatch) {
      const extracted = intentMatch[1].trim();
      const genericTerms = [
        'product',
        'products',
        'anything',
        'mobile',
        'mobiles',
        'phone',
        'phones',
        'laptop',
        'laptops',
        'headphone',
        'headphones',
        'camera',
        'cameras',
        'accessories',
      ];
      if (!genericTerms.includes(extracted) && extracted.length > 2) {
        keyword = extracted;
      }
    }
  }

  if (!category && !maxPrice && !minPrice && !brands && !keyword) {
    return { isGreeting: false, intent: 'unknown', reply: '' };
  }

  return {
    isGreeting: false,
    intent: 'product_search',
    category,
    maxPrice,
    minPrice,
    keyword,
    brands,
    sortByPrice,
    reply: '',
  };
}

function buildSystemContext(
  userId: number | null,
  userContext: UserContext,
): string {
  if (userId && userContext.name) {
    return `You are a friendly AI shopping assistant for ShopNow, talking to ${userContext.name}. 
       Their interests: ${userContext.interests?.join(', ') || 'general electronics'}.
       Recent orders: ${userContext.recentOrders?.map((o) => `Order #${o.id} (${o.status}) - ₹${o.totalAmount}`).join(', ') || 'none'}.
       Last shipping address: ${userContext.lastAddress ? JSON.stringify(userContext.lastAddress) : 'not available'}.
       Use their name, reference their orders when relevant.`;
  }
  return `You are a friendly AI shopping assistant for ShopNow, talking to a guest user.`;
}

async function classifyIntent(
  message: string,
  systemContext: string,
  history?: Array<{ role: string; content: string }>,
): Promise<ParsedIntent> {
  const provider = getAIProvider();

  const historyContext = history?.length
    ? `\nConversation so far:\n${history.map((h) => `${h.role}: ${h.content}`).join('\n')}\n`
    : '';

  const prompt = `${systemContext}
${historyContext}
User message: "${message}"

Analyze intent: greeting, orders, address, product_search, bundle_advisor, top_picks, popular_products, add_to_cart, gaming_build, or unknown.
- For greetings: write a warm personalised welcome using their name if available, mention their interests.
- For orders: summarise their recent order history.
- For address: show/confirm their last shipping address.
- For add_to_cart: ONLY when user explicitly says "add to cart". NOT when they say "I want to buy X" (that's product_search).
- For popular_products: when user asks about "what's popular", "trending", "bestsellers", "most reviewed", "what should I buy" in a general sense (not category-specific).
- For gaming_build: when user wants to BUILD or ASSEMBLE a gaming PC, mentions "gaming rig", "gaming build", "PC build", "build my PC", asks about compatible parts, "which processor/CPU/GPU should I pair with", or wants a complete gaming setup with desktop components.
  Example: "build me a gaming PC for 80k" → gaming_build
  Example: "I want to assemble a gaming rig" → gaming_build
  Example: "help me pick parts for a gaming computer" → gaming_build
  Example: "which CPU goes with RTX 4070?" → gaming_build
- For bundle_advisor: when user mentions a PERSONA (student, professional, creator, work from home) AND wants recommendations/suggestions/a setup. NOT for gaming PC builds.
- For product_search: extract category, maxPrice, minPrice, keyword, brands, sortByPrice, sortByRating as before.
  * category: one of Mobiles, Laptops, Accessories, Audio, Cameras
  * maxPrice: upper price limit in INR (number)
  * minPrice: lower price limit in INR (number)
  * keyword: THE SPECIFIC product model or name the user is asking about. This is CRITICAL.
    - "I want to buy Galaxy S22" → keyword: "Galaxy S22"
    - "show me iPhone 15 Pro" → keyword: "iPhone 15 Pro"  
    - "Samsung S24 Ultra" → keyword: "S24 Ultra"
    - "MacBook Air M2" → keyword: "MacBook Air M2"
    - "Sony WH-1000XM5" → keyword: "WH-1000XM5"
    - "I want to build a gaming PC" → keyword: "gaming"
    - "show me mobiles" → keyword: null (generic, no specific model)
    IMPORTANT: If the user mentions a SPECIFIC model name/number, ALWAYS extract it as keyword. 
    Do NOT leave keyword null when user is asking about a specific product.
  * brands: array of brand names to filter by (e.g. ["Apple", "Samsung"])
    - Extract brand from context: "Galaxy S22" → brands: ["Samsung"]
    - "iPhone" → brands: ["Apple"]
    - "MacBook" → brands: ["Apple"]
  * sortByPrice: "asc" for cheapest first, "desc" for most expensive first
  * sortByRating: true when user asks for "best rated", "top rated", "highest rated", "best reviews" products

  IMPORTANT clarification rule: if the message only gives a budget (for example, "show me products under 30k", "anything below 30000", or "suggest something affordable") and does not include a category, product keyword, brand, persona, or use case:
  - classify as product_search
  - extract minPrice/maxPrice correctly
  - set category and keyword to null
  - do not infer a category or interest

  IMPORTANT price tier rules for Indian electronics market:
  - "premium", "flagship", "high-end", "luxury", "top" → set minPrice high (Mobiles: 60000, Laptops: 80000, Audio: 15000, Cameras: 50000), sortByPrice: "desc", brands: top-tier brands
  - "budget", "cheap", "affordable", "value for money", "economical" → set maxPrice low (Mobiles: 25000, Laptops: 50000, Audio: 5000, Cameras: 30000), sortByPrice: "asc"
  - "mid-range", "moderate" → set both minPrice and maxPrice (Mobiles: 25000-60000, Laptops: 50000-80000)
  - If user mentions a specific brand like "Apple", "Samsung", "Sony", "Dell" etc, include it in brands array
  
- For unknown: ask a helpful clarifying question.

Always write a natural, friendly conversational reply.`;

  try {
    const result = await provider.generateStructuredJSON(prompt, INTENT_SCHEMA);
    return result as unknown as ParsedIntent;
  } catch (error) {
    console.warn(
      '[RouterAgent] AI provider failed, using local fallback:',
      error,
    );
    return localFallbackParse(message, history);
  }
}

export class RouterAgent {
  async classifyIntent(ctx: AgentContext): Promise<ParsedIntent> {
    const systemContext = buildSystemContext(ctx.userId, ctx.userContext);

    // Active Gaming PC build continuation check before LLM classification
    const lastAssistantMsg = [...(ctx.history || [])]
      .reverse()
      .find((h) => h.role === 'assistant');
    const lastContentLower = (lastAssistantMsg?.content || '').toLowerCase();
    const isGamingBuildActive =
      lastContentLower.includes('gaming pc') ||
      lastContentLower.includes('pc build') ||
      lastContentLower.includes('total budget') ||
      lastContentLower.includes('display target') ||
      lastContentLower.includes('primary use case') ||
      lastContentLower.includes('components selected') ||
      lastContentLower.includes('ready to add') ||
      lastContentLower.includes('coupon savings');

    const msgLower = ctx.message.toLowerCase();
    const isTopicSwitch =
      msgLower.includes('show me mobile') ||
      msgLower.includes('show me laptop') ||
      msgLower.includes('my orders') ||
      msgLower.includes('my address');

    if (isGamingBuildActive && !isTopicSwitch) {
      return { isGreeting: false, intent: 'gaming_build', reply: '' };
    }

    return classifyIntent(ctx.message, systemContext, ctx.history);
  }
}
