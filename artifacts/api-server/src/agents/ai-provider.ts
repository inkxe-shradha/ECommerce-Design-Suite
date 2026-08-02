import { GoogleGenAI, Type } from '@google/genai';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AIAvailability {
  available: boolean;
  provider: 'google' | 'opencode';
  model?: string;
  error?: string;
}

export interface StructuredSchema {
  type: string;
  properties: Record<string, any>;
}

// ---------------------------------------------------------------------------
// Provider interface
// ---------------------------------------------------------------------------

interface AIProvider {
  generateStructuredJSON(
    prompt: string,
    schema: StructuredSchema,
  ): Promise<Record<string, any>>;
  checkAvailability(): Promise<AIAvailability>;
}

// ---------------------------------------------------------------------------
// Gemini Provider
// ---------------------------------------------------------------------------

const GEMINI_DEFAULT_MODELS = [
  'gemini-3.5-flash',
  'gemini-3-flash-preview',
  'gemini-flash-latest',
  'gemini-2.0-flash',
];

const GEMINI_MODELS_CACHE_TTL_MS = 5 * 60 * 1000;
let cachedGeminiModels: { models: string[]; expiresAt: number } | null = null;

const NON_TEXT_MODEL_PATTERN =
  /(?:tts|image|lyria|robotics|deep-research|nano-banana|computer-use|antigravity)/i;
const ROUTER_MODEL_PATTERN = /^gemini-(?:\d+(?:\.\d+)?-)?flash(?:-|$)/i;

function getConfiguredGeminiModels(): string[] {
  return [process.env.GEMINI_MODEL, ...GEMINI_DEFAULT_MODELS]
    .filter((model): model is string => Boolean(model))
    .filter((model, index, models) => models.indexOf(model) === index);
}

async function discoverGeminiModels(apiKey: string): Promise<string[]> {
  if (cachedGeminiModels && cachedGeminiModels.expiresAt > Date.now()) {
    return cachedGeminiModels.models;
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(apiKey)}`,
  );
  if (!response.ok) {
    throw new Error(
      `Gemini model discovery failed with HTTP ${response.status}`,
    );
  }

  const data = (await response.json()) as {
    models?: Array<{ name?: string; supportedGenerationMethods?: string[] }>;
  };
  const models = (data.models ?? [])
    .filter((model) =>
      model.supportedGenerationMethods?.includes('generateContent'),
    )
    .map((model) => model.name?.replace(/^models\//, ''))
    .filter((model): model is string => Boolean(model))
    .filter(
      (model) =>
        !NON_TEXT_MODEL_PATTERN.test(model) && ROUTER_MODEL_PATTERN.test(model),
    );

  cachedGeminiModels = {
    models,
    expiresAt: Date.now() + GEMINI_MODELS_CACHE_TTL_MS,
  };
  return models;
}

async function getGeminiModels(apiKey: string): Promise<string[]> {
  const configuredModels = getConfiguredGeminiModels();
  try {
    const availableModels = await discoverGeminiModels(apiKey);
    const preferredAvailableModels = configuredModels.filter((model) =>
      availableModels.includes(model),
    );
    return [...preferredAvailableModels, ...availableModels].filter(
      (model, index, models) => models.indexOf(model) === index,
    );
  } catch (error) {
    console.warn('[AIService] Gemini model discovery failed:', error);
    return configuredModels;
  }
}

class GeminiProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
  }

  async generateStructuredJSON(
    prompt: string,
    schema: StructuredSchema,
  ): Promise<Record<string, any>> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    const models = await getGeminiModels(this.apiKey);

    for (const model of models) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: schema.properties,
            },
          },
        });
        return JSON.parse(response.text || '{}');
      } catch (error) {
        console.warn(`[AIService] Gemini model ${model} failed:`, error);
      }
    }

    throw new Error('All Gemini models failed');
  }

  async checkAvailability(): Promise<AIAvailability> {
    if (!this.apiKey) {
      return {
        available: false,
        provider: 'google',
        error: 'GEMINI_API_KEY is not configured',
      };
    }

    const ai = new GoogleGenAI({ apiKey: this.apiKey });
    let checkedModels: string[];
    try {
      checkedModels = await getGeminiModels(this.apiKey);
    } catch (error) {
      return {
        available: false,
        provider: 'google',
        error: error instanceof Error ? error.message : 'Model discovery failed',
      };
    }

    for (const model of checkedModels) {
      try {
        await ai.models.generateContent({
          model,
          contents: 'Return a JSON object confirming availability.',
          config: {
            maxOutputTokens: 16,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                available: { type: Type.BOOLEAN },
              },
            },
          },
        });
        return { available: true, provider: 'google', model };
      } catch {
        // try next model
      }
    }

    return {
      available: false,
      provider: 'google',
      error: 'No configured Gemini model responded',
    };
  }
}

// ---------------------------------------------------------------------------
// OpenCode Provider
// ---------------------------------------------------------------------------

const OPENCODE_BASE_URL = 'https://opencode.ai/zen/v1';
const OPENCODE_MODEL = 'mimo-v2.5-free';

class OpenCodeProvider implements AIProvider {
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.OPENCODE_API_KEY || '';
  }

  async generateStructuredJSON(
    prompt: string,
    _schema: StructuredSchema,
  ): Promise<Record<string, any>> {
    if (!this.apiKey) {
      throw new Error('OPENCODE_API_KEY is not configured');
    }

    const response = await fetch(
      `${OPENCODE_BASE_URL}/chat/completions`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: OPENCODE_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'You must respond ONLY with valid JSON. No markdown, no explanation, just the raw JSON object.',
            },
            { role: 'user', content: prompt },
          ],
          response_format: { type: 'json_object' },
          max_tokens: 4096,
        }),
      },
    );

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `OpenCode API error ${response.status}: ${text.slice(0, 200)}`,
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  async checkAvailability(): Promise<AIAvailability> {
    if (!this.apiKey) {
      return {
        available: false,
        provider: 'opencode',
        error: 'OPENCODE_API_KEY is not configured',
      };
    }

    try {
      const response = await fetch(
        `${OPENCODE_BASE_URL}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiKey}`,
          },
          body: JSON.stringify({
            model: OPENCODE_MODEL,
            messages: [{ role: 'user', content: 'Say "ok"' }],
            max_tokens: 8,
          }),
        },
      );

      if (!response.ok) {
        const text = await response.text();
        return {
          available: false,
          provider: 'opencode',
          error: `HTTP ${response.status}: ${text.slice(0, 200)}`,
        };
      }

      return { available: true, provider: 'opencode', model: OPENCODE_MODEL };
    } catch (error) {
      return {
        available: false,
        provider: 'opencode',
        error: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }
}

// ---------------------------------------------------------------------------
// Singleton provider access
// ---------------------------------------------------------------------------

let cachedProvider: AIProvider | null = null;

export function getAIProvider(): AIProvider {
  if (cachedProvider) return cachedProvider;

  const provider = (process.env.AI_PROVIDER || 'google').toLowerCase();

  if (provider === 'opencode') {
    cachedProvider = new OpenCodeProvider();
  } else {
    cachedProvider = new GeminiProvider();
  }

  console.log(`[AIService] Active provider: ${provider}`);
  return cachedProvider;
}

export async function checkAIAvailability(): Promise<AIAvailability> {
  return getAIProvider().checkAvailability();
}
