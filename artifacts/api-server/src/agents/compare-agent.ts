import { getAIProvider, type StructuredSchema } from './ai-provider.js';

export interface CompareFeature {
  label: string;
  icon: string;
  values: string[];
  winner?: number;
  higherIsBetter?: boolean;
}

export interface CompareResult {
  summary: string;
  features: CompareFeature[];
  followUpQuestions: string[];
  verdict?: string;
}

export interface RecommendResult {
  bestProductIndex: number;
  reason: string;
  alternativeNote?: string;
}

const COMPARE_SCHEMA: StructuredSchema = {
  type: 'object',
  properties: {
    summary: { type: 'string' },
    features: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          label: { type: 'string' },
          icon: { type: 'string' },
          values: { type: 'array', items: { type: 'string' } },
          winner: { type: 'number' },
          higherIsBetter: { type: 'boolean' },
        },
      },
    },
    followUpQuestions: { type: 'array', items: { type: 'string' } },
  },
};

const RECOMMEND_SCHEMA: StructuredSchema = {
  type: 'object',
  properties: {
    bestProductIndex: { type: 'number' },
    reason: { type: 'string' },
    alternativeNote: { type: 'string' },
  },
};

export async function compareProducts(products: any[]): Promise<CompareResult> {
  const provider = getAIProvider();

  const productSummaries = products.map(
    (p, i) =>
      `Product ${i + 1}: ${p.name}\nPrice: ₹${Math.round(parseFloat(p.price)).toLocaleString()}\nRating: ${p.rating}\nBrand: ${p.brand || 'Unknown'}\nDiscount: ${p.discountPct || 0}%\nSpecs: ${p.specs || 'N/A'}`,
  );

  const prompt = `You are an expert product advisor for an Indian electronics e-commerce store.

Compare these ${products.length} products and return structured JSON.

Products:
${productSummaries.join('\n\n')}

Return JSON with this exact schema:
{
  "summary": "One sentence overview of how these products differ",
  "features": [
    {
      "label": "Feature name (e.g. Price, Performance, Battery, Display)",
      "icon": "Single relevant emoji",
      "values": ["value for product 1", "value for product 2", ...],
      "winner": 0,
      "higherIsBetter": true
    }
  ],
  "followUpQuestions": [
    "Question 1 relevant to help choose between these products (e.g. budget, use case)",
    "Question 2",
    "Question 3"
  ]
}

Rules:
- Include 5-7 features that matter most for these products (Price, Rating, Brand, Performance/Speed, Battery Life, Display/Screen, Camera, Storage, Weight, Value for Money — pick what's relevant)
- winner: 0-based index of the product that wins that feature, -1 for tie/not applicable
- higherIsBetter: true if a higher value is better for this feature (false for Price, Weight)
- followUpQuestions: 3 smart questions to help narrow down the best choice for the user. Base them on the specs and differences. Always include one about budget range.
- Keep feature values concise (under 30 chars each)
- Respond ONLY with valid JSON, no markdown`;

  try {
    const json = await provider.generateStructuredJSON(prompt, COMPARE_SCHEMA);
    return {
      summary: json.summary || '',
      features: json.features || [],
      followUpQuestions: json.followUpQuestions || [],
    };
  } catch (err) {
    console.error('compareProducts error:', err);
    return buildFallbackComparison(products);
  }
}

export async function recommendProduct(
  products: any[],
  userAnswers: string,
): Promise<RecommendResult> {
  const provider = getAIProvider();

  const productSummaries = products.map(
    (p, i) =>
      `Product ${i + 1}: ${p.name} — ₹${Math.round(parseFloat(p.price)).toLocaleString()} — Rating: ${p.rating} — ${p.specs || ''}`,
  );

  const prompt = `You are an expert product advisor. Based on user preferences, pick the best product.

Products:
${productSummaries.join('\n')}

User preferences/answers: "${userAnswers}"

Return JSON:
{
  "bestProductIndex": 0,
  "reason": "Clear 2-sentence reason why this product fits the user best",
  "alternativeNote": "Optional note about when another product might be better"
}

bestProductIndex is 0-based. Respond ONLY with valid JSON.`;

  try {
    const json = await provider.generateStructuredJSON(prompt, RECOMMEND_SCHEMA);
    return {
      bestProductIndex: json.bestProductIndex ?? 0,
      reason: json.reason || '',
      alternativeNote: json.alternativeNote,
    };
  } catch {
    return {
      bestProductIndex: 0,
      reason: 'Based on your requirements, this product is the best fit.',
    };
  }
}

function buildFallbackComparison(products: any[]): CompareResult {
  const prices = products.map((p) => parseFloat(p.price));
  const minPriceIdx = prices.indexOf(Math.min(...prices));
  const ratings = products.map((p) => parseFloat(p.rating || '0'));
  const maxRatingIdx = ratings.indexOf(Math.max(...ratings));
  const discounts = products.map((p) => p.discountPct || 0);
  const maxDiscountIdx = discounts.indexOf(Math.max(...discounts));

  return {
    summary: `Comparing ${products.length} products across price, rating, and value.`,
    features: [
      {
        label: 'Price',
        icon: '💰',
        values: prices.map((p) => `₹${Math.round(p).toLocaleString()}`),
        winner: minPriceIdx,
        higherIsBetter: false,
      },
      {
        label: 'Rating',
        icon: '⭐',
        values: ratings.map((r) => `${r}/5`),
        winner: maxRatingIdx,
        higherIsBetter: true,
      },
      {
        label: 'Discount',
        icon: '🏷️',
        values: discounts.map((d) => `${d}% off`),
        winner: maxDiscountIdx,
        higherIsBetter: true,
      },
      {
        label: 'Brand',
        icon: '🏢',
        values: products.map((p) => p.brand || 'Unknown'),
        winner: -1,
      },
    ],
    followUpQuestions: [
      'What is your budget range?',
      'What will you primarily use this for?',
      'Do you prefer better performance or longer battery life?',
    ],
  };
}
