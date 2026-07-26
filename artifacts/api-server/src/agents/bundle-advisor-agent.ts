import { db, productsTable } from '@workspace/db';
import {
  ilike,
  and,
  lte,
  gte,
  eq,
  desc,
  or as drizzleOr,
  sql,
  count,
} from 'drizzle-orm';
import type {
  Agent,
  AgentContext,
  AgentResponse,
  ParsedIntent,
} from './types.js';

/**
 * BundleAdvisorAgent - Intelligent multi-turn conversational agent that:
 * 1. Detects persona/profession and maps to electronics needs
 * 2. Has guardrails for non-electronics requests
 * 3. Checks actual store inventory before recommending
 * 4. Asks smart follow-up questions based on what's available
 * 5. Builds curated bundles of complementary products
 */

interface BundleCategory {
  category: string;
  keywords?: string[];
  maxPrice?: number;
  label: string; // Human-friendly label like "a laptop for coding"
}

interface BundleProfile {
  persona: string;
  emoji: string;
  label: string;
  description: string;
  categories: BundleCategory[];
}

// Non-electronics keywords that trigger the guardrail
const NON_ELECTRONICS_KEYWORDS = [
  'clothes',
  'clothing',
  'shirt',
  'pants',
  'jeans',
  'dress',
  'shoes',
  'sneakers',
  'jacket',
  'hoodie',
  'tshirt',
  't-shirt',
  'food',
  'grocery',
  'vegetables',
  'fruits',
  'snacks',
  'drinks',
  'furniture',
  'sofa',
  'table',
  'chair',
  'bed',
  'mattress',
  'desk',
  'makeup',
  'cosmetics',
  'skincare',
  'perfume',
  'shampoo',
  'books',
  'novel',
  'textbook',
  'stationery',
  'pen',
  'notebook',
  'toys',
  'games board',
  'puzzle',
  'doll',
  'kitchen',
  'utensils',
  'cookware',
  'blender',
  'sports',
  'cricket bat',
  'football',
  'gym equipment',
  'yoga mat',
  'medicine',
  'pharmacy',
  'supplements',
  'jewellery',
  'jewelry',
  'ring',
  'necklace',
  'watch',
  'car',
  'bike',
  'automobile',
  'vehicle',
];

// Expanded profession → electronics mapping
const BUNDLE_PROFILES: Record<string, BundleProfile> = {
  student: {
    persona: 'student',
    emoji: '📚',
    label: 'Student',
    description: 'Perfect for college life — study, projects & entertainment',
    categories: [
      {
        category: 'Laptops',
        keywords: ['thin', 'light'],
        maxPrice: 60000,
        label: 'a portable laptop for classes & projects',
      },
      {
        category: 'Audio',
        keywords: ['headphone', 'wireless', 'earbuds'],
        maxPrice: 5000,
        label: 'wireless earbuds/headphones for focus',
      },
      {
        category: 'Accessories',
        keywords: ['mouse', 'power bank'],
        maxPrice: 3000,
        label: 'essential accessories',
      },
    ],
  },
  gamer: {
    persona: 'gamer',
    emoji: '🎮',
    label: 'Gaming',
    description: 'High-performance gear for competitive gaming',
    categories: [
      {
        category: 'Laptops',
        keywords: ['gaming', 'RTX', 'performance'],
        maxPrice: 120000,
        label: 'a powerful gaming laptop',
      },
      {
        category: 'Audio',
        keywords: ['gaming', 'headset', 'headphone'],
        maxPrice: 10000,
        label: 'immersive gaming headset',
      },
      {
        category: 'Accessories',
        keywords: ['gaming', 'mouse', 'keyboard'],
        maxPrice: 8000,
        label: 'precision gaming peripherals',
      },
    ],
  },
  professional: {
    persona: 'professional',
    emoji: '💼',
    label: 'Professional',
    description: 'Productivity powerhouse for work & meetings',
    categories: [
      {
        category: 'Laptops',
        keywords: ['pro', 'business', 'macbook'],
        maxPrice: 150000,
        label: 'a reliable work laptop',
      },
      {
        category: 'Audio',
        keywords: ['noise cancelling', 'wireless', 'headphone'],
        maxPrice: 25000,
        label: 'noise-cancelling headphones for focus',
      },
      {
        category: 'Accessories',
        keywords: ['webcam', 'mouse', 'keyboard'],
        maxPrice: 10000,
        label: 'ergonomic work accessories',
      },
    ],
  },
  creator: {
    persona: 'creator',
    emoji: '🎬',
    label: 'Content Creator',
    description: 'Shoot, edit & publish professional content',
    categories: [
      {
        category: 'Cameras',
        keywords: ['mirrorless', 'vlog', '4K'],
        maxPrice: 80000,
        label: 'a camera for shooting content',
      },
      {
        category: 'Audio',
        keywords: ['microphone', 'wireless', 'headphone'],
        maxPrice: 15000,
        label: 'quality audio gear',
      },
      {
        category: 'Laptops',
        keywords: ['pro', 'editing', 'performance'],
        maxPrice: 100000,
        label: 'a laptop for editing',
      },
    ],
  },
  doctor: {
    persona: 'doctor',
    emoji: '🩺',
    label: 'Medical Professional',
    description: 'Tech essentials for healthcare professionals',
    categories: [
      {
        category: 'Laptops',
        keywords: ['lightweight', 'thin', 'portable'],
        maxPrice: 80000,
        label: 'a portable laptop for notes & research',
      },
      {
        category: 'Mobiles',
        keywords: ['5G', 'pro'],
        maxPrice: 50000,
        label: 'a reliable phone for on-call',
      },
      {
        category: 'Audio',
        keywords: ['noise cancelling', 'wireless'],
        maxPrice: 10000,
        label: 'headphones for study/relaxation',
      },
    ],
  },
  teacher: {
    persona: 'teacher',
    emoji: '👩‍🏫',
    label: 'Teacher/Educator',
    description: 'Tech for teaching, presentations & grading',
    categories: [
      {
        category: 'Laptops',
        keywords: ['thin', 'portable', 'light'],
        maxPrice: 55000,
        label: 'a laptop for lesson prep & grading',
      },
      {
        category: 'Accessories',
        keywords: ['webcam', 'mouse', 'keyboard'],
        maxPrice: 5000,
        label: 'accessories for online classes',
      },
      {
        category: 'Audio',
        keywords: ['headphone', 'wireless'],
        maxPrice: 4000,
        label: 'a headset for virtual classes',
      },
    ],
  },
  architect: {
    persona: 'architect',
    emoji: '🏗️',
    label: 'Architect/Designer',
    description: 'Powerful hardware for CAD, 3D rendering & design',
    categories: [
      {
        category: 'Laptops',
        keywords: ['performance', 'RTX', 'pro'],
        maxPrice: 150000,
        label: 'a powerful laptop for CAD/3D',
      },
      {
        category: 'Accessories',
        keywords: ['mouse', 'keyboard'],
        maxPrice: 8000,
        label: 'precision input devices',
      },
      {
        category: 'Audio',
        keywords: ['noise cancelling', 'headphone'],
        maxPrice: 15000,
        label: 'focus headphones for deep work',
      },
    ],
  },
  musician: {
    persona: 'musician',
    emoji: '🎵',
    label: 'Musician/Audio',
    description: 'Professional audio production setup',
    categories: [
      {
        category: 'Audio',
        keywords: ['studio', 'monitor', 'headphone'],
        maxPrice: 20000,
        label: 'studio-quality headphones',
      },
      {
        category: 'Laptops',
        keywords: ['pro', 'performance'],
        maxPrice: 100000,
        label: 'a laptop for music production',
      },
      {
        category: 'Accessories',
        keywords: ['USB', 'audio', 'interface'],
        maxPrice: 10000,
        label: 'audio accessories',
      },
    ],
  },
  photographer: {
    persona: 'photographer',
    emoji: '📸',
    label: 'Photographer',
    description: 'Capture & edit stunning photos',
    categories: [
      {
        category: 'Cameras',
        keywords: ['mirrorless', 'DSLR', '4K'],
        maxPrice: 100000,
        label: 'a professional camera',
      },
      {
        category: 'Laptops',
        keywords: ['pro', 'display', 'color'],
        maxPrice: 90000,
        label: 'a laptop with great display for editing',
      },
      {
        category: 'Accessories',
        keywords: ['storage', 'card', 'tripod'],
        maxPrice: 5000,
        label: 'essential photography accessories',
      },
    ],
  },
  freelancer: {
    persona: 'freelancer',
    emoji: '🏠',
    label: 'Freelancer/Remote Worker',
    description: 'Complete home office for productive remote work',
    categories: [
      {
        category: 'Laptops',
        keywords: ['pro', 'thin', 'portable'],
        maxPrice: 80000,
        label: 'a versatile work laptop',
      },
      {
        category: 'Audio',
        keywords: ['noise cancelling', 'wireless', 'headphone'],
        maxPrice: 15000,
        label: 'headphones for calls & focus',
      },
      {
        category: 'Accessories',
        keywords: ['webcam', 'mouse', 'keyboard', 'power bank'],
        maxPrice: 8000,
        label: 'home office essentials',
      },
    ],
  },
};

// Map alternate keywords to profile keys
const PERSONA_KEYWORDS: Record<string, string[]> = {
  student: [
    'student',
    'college',
    'university',
    'study',
    'studies',
    'engineering',
    'btech',
    'mba',
    'school',
  ],
  gamer: ['gaming', 'gamer', 'game', 'esports', 'fps', 'streaming'],
  professional: [
    'professional',
    'work from home',
    'office',
    'business',
    'corporate',
    'manager',
    'executive',
  ],
  creator: [
    'creator',
    'youtube',
    'youtuber',
    'vlog',
    'vlogger',
    'content',
    'influencer',
    'tiktok',
    'instagram',
  ],
  doctor: [
    'doctor',
    'medical',
    'nurse',
    'hospital',
    'healthcare',
    'clinic',
    'physician',
  ],
  teacher: [
    'teacher',
    'professor',
    'educator',
    'teaching',
    'instructor',
    'lecturer',
    'tutor',
  ],
  architect: [
    'architect',
    'designer',
    'interior design',
    'cad',
    '3d design',
    'civil engineer',
  ],
  musician: [
    'musician',
    'music production',
    'music',
    'producer',
    'dj',
    'singer',
    'composer',
    'audio engineer',
  ],
  photographer: [
    'photographer',
    'photography',
    'photoshoot',
    'wedding photographer',
    'photo editing',
  ],
  freelancer: [
    'freelancer',
    'freelance',
    'remote',
    'work from home',
    'wfh',
    'home office',
    'startup',
  ],
};

export class BundleAdvisorAgent implements Agent {
  name = 'BundleAdvisorAgent';

  async execute(
    ctx: AgentContext,
    parsed: ParsedIntent,
  ): Promise<AgentResponse> {
    const { userContext, userId, message, history } = ctx;
    const name = userContext.name ? `, ${userContext.name}` : '';
    const lower = message.toLowerCase();

    // ═══════════════════════════════════════════════════════
    // GUARDRAIL: Check for non-electronics requests first
    // ═══════════════════════════════════════════════════════
    const nonElecGuard = this.checkNonElectronicsGuardrail(lower);
    if (nonElecGuard) return nonElecGuard(name);

    // Determine the persona from message + conversation history
    const persona = this.detectPersona(lower, history);
    // Check if user specified a budget
    const budget = this.detectBudget(lower, history);
    // Check if we have enough context to build a bundle
    const readiness = this.assessReadiness(lower, history, persona, budget);

    if (readiness === 'ask_persona') {
      return this.askPersonaQuestion(name);
    }
    if (readiness === 'ask_needs') {
      return this.askNeedsQuestion(persona!, name);
    }
    if (readiness === 'ask_budget') {
      return this.askBudgetQuestion(persona!, name);
    }

    // We have enough context — check inventory and build the bundle
    return this.buildSmartBundle(
      persona!,
      budget,
      name,
      userId,
      userContext,
      lower,
      history,
    );
  }

  // ═══════════════════════════════════════════════════════
  // GUARDRAILS
  // ═══════════════════════════════════════════════════════

  private checkNonElectronicsGuardrail(
    lower: string,
  ): ((name: string) => AgentResponse) | null {
    const found = NON_ELECTRONICS_KEYWORDS.find((kw) => lower.includes(kw));
    if (!found) return null;

    return (name: string) => ({
      reply: `I appreciate you asking${name}, but I'm specialized in **electronics & tech** — things like laptops, phones, headphones, cameras, and accessories! 🔌\n\nI can't help with "${found}" unfortunately. But I *can* help you find the perfect tech setup for your needs!\n\nWhat do you use technology for? That'll help me recommend the right electronics.`,
      products: [],
      orders: [],
      followUp: [
        'I need a laptop for work',
        'Best phone for my budget',
        "I'm a student, suggest a setup",
        'Show me headphones',
      ],
      userContext: null,
    });
  }

  // ═══════════════════════════════════════════════════════
  // PERSONA DETECTION (expanded)
  // ═══════════════════════════════════════════════════════

  private detectPersona(
    lower: string,
    history?: Array<{ role: string; content: string }>,
  ): string | null {
    const allText = [
      lower,
      ...(history || []).map((h) => h.content.toLowerCase()),
    ].join(' ');

    // Check each persona's keywords
    for (const [persona, keywords] of Object.entries(PERSONA_KEYWORDS)) {
      if (keywords.some((kw) => allText.includes(kw))) {
        return persona;
      }
    }
    return null;
  }

  // ═══════════════════════════════════════════════════════
  // BUDGET DETECTION
  // ═══════════════════════════════════════════════════════

  private detectBudget(
    lower: string,
    history?: Array<{ role: string; content: string }>,
  ): number | null {
    const allText = [
      lower,
      ...(history || []).map((h) => h.content.toLowerCase()),
    ].join(' ');

    const matchK = allText.match(
      /(?:budget|under|below|around|about|within)?\s*₹?\s*(\d+)\s*k\b/,
    );
    if (matchK) return parseInt(matchK[1], 10) * 1000;

    const matchNum = allText.match(
      /(?:budget|under|below|around|about|within)\s*₹?\s*(\d{4,})/,
    );
    if (matchNum) return parseInt(matchNum[1], 10);

    // Budget tier words
    if (
      allText.includes('no budget') ||
      allText.includes('no limit') ||
      allText.includes('money is not')
    )
      return 500000;
    if (
      allText.includes('premium') ||
      allText.includes('high end') ||
      allText.includes('best possible')
    )
      return 200000;
    if (
      allText.includes('mid') ||
      allText.includes('moderate') ||
      allText.includes('decent')
    )
      return 70000;
    if (
      allText.includes('budget') ||
      allText.includes('cheap') ||
      allText.includes('affordable') ||
      allText.includes('tight')
    )
      return 35000;

    return null;
  }

  // ═══════════════════════════════════════════════════════
  // READINESS ASSESSMENT — determines what to ask next
  // ═══════════════════════════════════════════════════════

  private assessReadiness(
    lower: string,
    history: Array<{ role: string; content: string }> | undefined,
    persona: string | null,
    budget: number | null,
  ): 'ready' | 'ask_persona' | 'ask_needs' | 'ask_budget' {
    const userTurns = (history || []).filter((h) => h.role === 'user').length;

    // No persona at all — ask who they are
    if (!persona) return 'ask_persona';

    // If user said something generic like "I'm a student" with no specifics
    // and it's the first turn, ask what they need
    const allText = [
      lower,
      ...(history || []).map((h) => h.content.toLowerCase()),
    ].join(' ');
    const hasNeedSignal =
      allText.includes('good for me') ||
      allText.includes('suggest') ||
      allText.includes('recommend') ||
      allText.includes('setup') ||
      allText.includes('bundle') ||
      allText.includes('need') ||
      allText.includes('want') ||
      allText.includes('buy') ||
      allText.includes('help me');

    // After 1+ user turns with persona detected, we're ready
    if (userTurns >= 1 && persona) return 'ready';

    // First message with clear buy intent — go straight to bundle
    if (persona && hasNeedSignal) return 'ready';

    // Have persona but no intent signal — ask what they need
    if (persona && !hasNeedSignal) return 'ask_needs';

    return 'ready';
  }

  // ═══════════════════════════════════════════════════════
  // FOLLOW-UP QUESTIONS (intelligent, context-aware)
  // ═══════════════════════════════════════════════════════

  private askPersonaQuestion(name: string): AgentResponse {
    return {
      reply: `I'd love to help you find the perfect tech setup${name}! 🎯\n\nTo suggest the best electronics for you, tell me — what do you do? Your profession/lifestyle helps me pick the right gear:`,
      products: [],
      orders: [],
      followUp: [
        "🎓 I'm a student",
        "🎮 I'm a gamer",
        '💼 I work in an office',
        '🎬 I create content',
        "🩺 I'm in healthcare",
        "📸 I'm into photography",
      ],
      userContext: null,
    };
  }

  private askNeedsQuestion(persona: string, name: string): AgentResponse {
    const profile = BUNDLE_PROFILES[persona] || BUNDLE_PROFILES.student;
    return {
      reply: `${profile.emoji} Got it${name}! As a ${profile.label.toLowerCase()}, I can suggest a complete tech setup for you.\n\n${profile.description}.\n\nWould you like me to build a complete bundle, or are you looking for something specific?`,
      products: [],
      orders: [],
      followUp: [
        `Build me a complete ${persona} setup`,
        'I just need a laptop',
        'Suggest headphones/audio',
        'What fits my budget?',
      ],
      userContext: null,
    };
  }

  private askBudgetQuestion(persona: string, name: string): AgentResponse {
    const profile = BUNDLE_PROFILES[persona] || BUNDLE_PROFILES.student;
    return {
      reply: `${profile.emoji} Great${name}! I'll build the perfect ${profile.label.toLowerCase()} bundle for you.\n\nWhat's your overall budget? This helps me pick the right quality tier:`,
      products: [],
      orders: [],
      followUp: [
        'Under ₹30,000 (Budget-friendly)',
        'Around ₹50,000 (Good value)',
        'Around ₹80,000 (Premium)',
        '₹1,00,000+ (Best of the best)',
      ],
      userContext: null,
    };
  }

  // ═══════════════════════════════════════════════════════
  // SMART BUNDLE BUILDER (inventory-aware)
  // ═══════════════════════════════════════════════════════

  private async buildSmartBundle(
    persona: string,
    budget: number | null,
    name: string,
    userId: number | null,
    userContext: any,
    lower: string,
    history?: Array<{ role: string; content: string }>,
  ): Promise<AgentResponse> {
    const profile = BUNDLE_PROFILES[persona] || BUNDLE_PROFILES.student;

    // First: check what categories we actually have in stock
    const availableCategories = await this.checkAvailableInventory(
      profile.categories,
    );

    if (availableCategories.length === 0) {
      // Nothing from this profile is in stock — suggest alternatives
      return this.suggestAlternatives(profile, name, userId, userContext);
    }

    // Scale max prices based on overall budget
    const totalBudgetNeeded = profile.categories.reduce(
      (sum, c) => sum + (c.maxPrice || 30000),
      0,
    );
    const budgetMultiplier = budget ? budget / totalBudgetNeeded : 1;

    const bundleProducts: any[] = [];
    const unavailableNeeds: string[] = [];

    for (const cat of profile.categories) {
      const scaledMax = Math.round(
        (cat.maxPrice || 50000) * Math.max(budgetMultiplier, 0.5),
      );
      const product = await this.findBestProduct(cat, scaledMax);

      if (product) {
        bundleProducts.push(product);
      } else {
        unavailableNeeds.push(cat.label);
      }
    }

    if (bundleProducts.length === 0) {
      return {
        reply: `I looked through our store but couldn't find products that match your exact needs within budget${name}. Let me help differently!`,
        products: [],
        orders: [],
        followUp: [
          'Increase my budget',
          'Show me what you have in Laptops',
          'Any alternatives?',
        ],
        userContext: null,
      };
    }

    const totalPrice = bundleProducts.reduce(
      (sum, p) => sum + parseFloat(p.price),
      0,
    );

    // Build intelligent response
    let reply = `${profile.emoji} **${profile.label} Bundle** for you${name}! 🎁\n\n`;
    reply += `${profile.description}\n\n`;
    reply += `Here's your curated ${bundleProducts.length}-item setup:\n`;
    bundleProducts.forEach((p, i) => {
      reply += `\n${i + 1}. **${p.name}**\n   ₹${Math.round(parseFloat(p.price)).toLocaleString('en-IN')} · ⭐ ${p.rating}/5 · ${p.brand}`;
    });
    reply += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━`;
    reply += `\n💰 **Bundle Total: ₹${Math.round(totalPrice).toLocaleString('en-IN')}**`;
    if (budget && totalPrice <= budget) {
      const saved = budget - totalPrice;
      reply += `\n✅ Within your ₹${budget.toLocaleString('en-IN')} budget`;
      if (saved > 1000)
        reply += ` (₹${Math.round(saved).toLocaleString('en-IN')} to spare!)`;
    } else if (budget && totalPrice > budget) {
      reply += `\n⚠️ Slightly over your ₹${budget.toLocaleString('en-IN')} budget — want me to find cheaper options?`;
    }

    // Mention unavailable items
    if (unavailableNeeds.length > 0) {
      reply += `\n\n💡 I couldn't find ${unavailableNeeds.join(', ')} in stock right now. Check back soon!`;
    }

    // Smart follow-ups based on context
    const followUp = this.generateSmartFollowUps(
      bundleProducts,
      unavailableNeeds,
      budget,
      totalPrice,
    );

    return {
      reply,
      products: bundleProducts,
      orders: [],
      followUp,
      userContext: userId
        ? {
            name: userContext.name,
            recentOrderCount: userContext.recentOrders?.length ?? 0,
            interests: userContext.interests,
          }
        : null,
    };
  }

  // ═══════════════════════════════════════════════════════
  // INVENTORY INTELLIGENCE
  // ═══════════════════════════════════════════════════════

  private async checkAvailableInventory(
    categories: BundleCategory[],
  ): Promise<string[]> {
    const available: string[] = [];
    for (const cat of categories) {
      const result = await db
        .select({ cnt: count() })
        .from(productsTable)
        .where(
          and(
            eq(productsTable.category, cat.category),
            eq(productsTable.inStock, true),
          ),
        );
      if (result[0]?.cnt > 0) {
        available.push(cat.category);
      }
    }
    return available;
  }

  private async findBestProduct(
    cat: BundleCategory,
    maxPrice: number,
  ): Promise<any | null> {
    const baseConditions = [
      eq(productsTable.inStock, true),
      eq(productsTable.category, cat.category),
      lte(productsTable.price, maxPrice.toString()),
    ];

    // Try keyword search first for relevance
    if (cat.keywords && cat.keywords.length > 0) {
      const keywordConditions = cat.keywords.map((kw) =>
        ilike(productsTable.name, `%${kw}%`),
      );
      const results = await db
        .select()
        .from(productsTable)
        .where(and(...baseConditions, drizzleOr(...keywordConditions)!))
        .orderBy(desc(productsTable.rating))
        .limit(1);
      if (results.length > 0) return results[0];
    }

    // Fallback: best-rated in category within budget
    const results = await db
      .select()
      .from(productsTable)
      .where(and(...baseConditions))
      .orderBy(desc(productsTable.rating))
      .limit(1);
    return results[0] || null;
  }

  private async suggestAlternatives(
    profile: BundleProfile,
    name: string,
    userId: number | null,
    userContext: any,
  ): Promise<AgentResponse> {
    // Find what IS available in the store
    const allCategories = [
      'Mobiles',
      'Laptops',
      'Audio',
      'Cameras',
      'Accessories',
    ];
    const availableCats: string[] = [];
    for (const cat of allCategories) {
      const result = await db
        .select({ cnt: count() })
        .from(productsTable)
        .where(
          and(eq(productsTable.category, cat), eq(productsTable.inStock, true)),
        );
      if (result[0]?.cnt > 0) availableCats.push(cat);
    }

    return {
      reply: `${profile.emoji} I wanted to build a ${profile.label.toLowerCase()} bundle${name}, but some items aren't available right now.\n\nHere's what we DO have in stock: **${availableCats.join(', ')}**\n\nWant me to suggest the best items from what's available?`,
      products: [],
      orders: [],
      followUp: availableCats.slice(0, 4).map((c) => `Show me best ${c}`),
      userContext: userId
        ? {
            name: userContext.name,
            recentOrderCount: userContext.recentOrders?.length ?? 0,
            interests: userContext.interests,
          }
        : null,
    };
  }

  // ═══════════════════════════════════════════════════════
  // SMART FOLLOW-UP GENERATION
  // ═══════════════════════════════════════════════════════

  private generateSmartFollowUps(
    products: any[],
    unavailable: string[],
    budget: number | null,
    totalPrice: number,
  ): string[] {
    const suggestions: string[] = ['Add all to cart'];

    if (budget && totalPrice > budget) {
      suggestions.push('Show cheaper alternatives');
    }

    // Suggest swapping the most expensive item
    if (products.length > 1) {
      const mostExpensive = products.reduce((a, b) =>
        parseFloat(a.price) > parseFloat(b.price) ? a : b,
      );
      suggestions.push(
        `Swap the ${mostExpensive.category.toLowerCase()} for cheaper`,
      );
    }

    if (unavailable.length > 0) {
      suggestions.push(`Alternatives for ${unavailable[0]}`);
    }

    suggestions.push('What else do I need?');

    return suggestions.slice(0, 4);
  }
}
