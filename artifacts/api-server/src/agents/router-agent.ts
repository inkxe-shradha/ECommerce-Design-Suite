import { GoogleGenAI, Type } from '@google/genai';
import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
  UserContext,
} from './types.js';
import { GreetingAgent } from './greeting-agent.js';
import { ProductSearchAgent } from './product-search-agent.js';
import { OrdersAgent } from './orders-agent.js';
import { AddressAgent } from './address-agent.js';
import { TopPicksAgent } from './top-picks-agent.js';
import { UnknownAgent } from './unknown-agent.js';
import { AddToCartAgent } from './add-to-cart-agent.js';
import { BundleAdvisorAgent } from './bundle-advisor-agent.js';
import { PopularProductsAgent } from './popular-products-agent.js';

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

function localFallbackParse(message: string): ParsedIntent {
  const lower = message.trim().toLowerCase();

  const isGreeting = GREETINGS.some(
    (g) =>
      lower === g || lower.startsWith(g + ' ') || lower.startsWith(g + '!'),
  );
  if (isGreeting) {
    return { isGreeting: true, intent: 'greeting', reply: '' };
  }

  // Add-to-cart intent (only when explicitly about cart, not "I want to buy X")
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

  // Bundle advisor intent - persona-based recommendations
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
  // Also catch: "I am a student want to buy good for me"
  if (
    hasBundlePersona &&
    (lower.includes('good') ||
      lower.includes('best') ||
      lower.includes('recommend'))
  ) {
    return { isGreeting: false, intent: 'bundle_advisor', reply: '' };
  }
  // Persona alone (e.g. "I am a student", "I'm a gamer") — route to bundle advisor
  // which will ask follow-up questions about what they need
  if (hasBundlePersona) {
    return { isGreeting: false, intent: 'bundle_advisor', reply: '' };
  }

  // Top rated / best rating intent — "best rated mobiles", "top rating phones", "highest rated laptops"
  const hasRatingIntent =
    lower.includes('best rat') ||
    lower.includes('top rat') ||
    lower.includes('highest rat') ||
    lower.includes('best review') ||
    lower.includes('top review') ||
    lower.includes('most rated') ||
    lower.includes('highly rated');
  if (hasRatingIntent) {
    // Detect category from the same message
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

  // Popular/Trending intent — "what's popular", "trending now", "most popular", "bestsellers"
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
  let brands: string[] | undefined;

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

  // Extract keyword — look for specific product model names in the message
  let keyword: string | undefined;
  const keywordPatterns = [
    // Match model numbers like "S22", "S24 Ultra", "iPhone 15 Pro", "M2 Pro", "RTX 4090"
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

  // If no pattern matched, try extracting a product name after intent words
  if (!keyword) {
    const intentMatch = lower.match(
      /(?:show me|find|search|looking for|i want|buy|get me|need)\s+(?:a |an |some |the )?(.+?)(?:\s+under|\s+below|\s+above|\s+from|$)/,
    );
    if (intentMatch) {
      const extracted = intentMatch[1].trim();
      // Only use as keyword if it's specific enough (not just a generic category)
      const genericTerms = [
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
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return localFallbackParse(message);
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Build conversation context from history
    const historyContext = history?.length
      ? `\nConversation so far:\n${history.map((h) => `${h.role}: ${h.content}`).join('\n')}\n`
      : '';

    const response = await ai.models.generateContent({
      model: 'gemini-1.5-flash',
      contents: `${systemContext}
${historyContext}
User message: "${message}"

Analyze intent: greeting, orders, address, product_search, bundle_advisor, top_picks, popular_products, add_to_cart, or unknown.
- For greetings: write a warm personalised welcome using their name if available, mention their interests.
- For orders: summarise their recent order history.
- For address: show/confirm their last shipping address.
- For add_to_cart: ONLY when user explicitly says "add to cart". NOT when they say "I want to buy X" (that's product_search).
- For popular_products: when user asks about "what's popular", "trending", "bestsellers", "most reviewed", "what should I buy" in a general sense (not category-specific).
  Example: "What's popular right now?" → popular_products
  Example: "Show me trending products" → popular_products
  Example: "What are bestsellers?" → popular_products
  Example: "What should I buy?" (generic, no specific category) → popular_products
- For bundle_advisor: when user mentions a PERSONA (student, gamer, professional, creator, work from home) AND wants recommendations/suggestions/a setup. 
  Example: "I am a student want to buy good for me" → bundle_advisor
  Example: "need a gaming setup" → bundle_advisor
  Example: "I'm a professional, what laptop should I get?" → bundle_advisor
- For product_search: extract the following:
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

  IMPORTANT price tier rules for Indian electronics market:
  - "premium", "flagship", "high-end", "luxury", "top" → set minPrice high (Mobiles: 60000, Laptops: 80000, Audio: 15000, Cameras: 50000), sortByPrice: "desc", brands: top-tier brands
  - "budget", "cheap", "affordable", "value for money", "economical" → set maxPrice low (Mobiles: 25000, Laptops: 50000, Audio: 5000, Cameras: 30000), sortByPrice: "asc"
  - "mid-range", "moderate" → set both minPrice and maxPrice (Mobiles: 25000-60000, Laptops: 50000-80000)
  - If user mentions a specific brand like "Apple", "Samsung", "Sony", "Dell" etc, include it in brands array
  
- For unknown: ask a helpful clarifying question.

Always write a natural, friendly conversational reply.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isGreeting: { type: Type.BOOLEAN },
            intent: { type: Type.STRING },
            category: { type: Type.STRING, nullable: true },
            maxPrice: { type: Type.NUMBER, nullable: true },
            minPrice: { type: Type.NUMBER, nullable: true },
            keyword: { type: Type.STRING, nullable: true },
            brands: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              nullable: true,
            },
            sortByPrice: {
              type: Type.STRING,
              nullable: true,
              description: '"asc" or "desc"',
            },
            sortByRating: {
              type: Type.BOOLEAN,
              nullable: true,
              description: 'true when user wants best/top rated products',
            },
            reply: { type: Type.STRING, description: 'Conversational reply' },
          },
        },
      },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.warn('Gemini API failed, falling back:', error);
    return localFallbackParse(message);
  }
}

const ORDER_INTENTS = ['orders', 'order', 'order_history', 'order_status'];

export class RouterAgent {
  private agents: Record<string, Agent>;

  constructor() {
    this.agents = {
      greeting: new GreetingAgent(),
      product_search: new ProductSearchAgent(),
      orders: new OrdersAgent(),
      order: new OrdersAgent(),
      order_history: new OrdersAgent(),
      order_status: new OrdersAgent(),
      address: new AddressAgent(),
      top_picks: new TopPicksAgent(),
      popular_products: new PopularProductsAgent(),
      add_to_cart: new AddToCartAgent(),
      bundle_advisor: new BundleAdvisorAgent(),
      unknown: new UnknownAgent(),
    };
  }

  async execute(ctx: AgentContext): Promise<AgentResponse> {
    const systemContext = buildSystemContext(ctx.userId, ctx.userContext);
    const parsed = await classifyIntent(
      ctx.message,
      systemContext,
      ctx.history,
    );

    const intentKey =
      parsed.isGreeting || parsed.intent === 'greeting'
        ? 'greeting'
        : parsed.intent || 'unknown';

    const agent = this.agents[intentKey] || this.agents['unknown'];

    console.log(
      `[RouterAgent] Intent: "${intentKey}" → Dispatching to ${agent.name}`,
    );

    return agent.execute(ctx, parsed);
  }
}
