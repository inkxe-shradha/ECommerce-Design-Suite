export interface UserContext {
  name?: string;
  recentOrders?: Array<{
    id: number;
    totalAmount: string;
    status: string;
    createdAt: string;
    address: any;
    products: string[];
  }>;
  lastAddress?: any;
  interests?: string[];
  purchasedProductIds?: number[];
  purchasedBrands?: string[];
}

export interface AgentContext {
  message: string;
  userId: number | null;
  userContext: UserContext;
  history?: Array<{ role: string; content: string }>;
}

export interface AgentResponse {
  reply: string;
  products: any[];
  orders: any[];
  requiresLogin?: boolean;
  followUp?: string[];
  userContext: {
    name?: string;
    recentOrderCount: number;
    interests?: string[];
  } | null;
}

export interface ParsedIntent {
  isGreeting?: boolean;
  intent?: string;
  category?: string | null;
  maxPrice?: number | null;
  minPrice?: number | null;
  keyword?: string | null;
  brands?: string[] | null;
  sortByPrice?: 'asc' | 'desc' | null;
  sortByRating?: boolean;
  reply?: string;
}

export interface Agent {
  name: string;
  execute(ctx: AgentContext, parsed: ParsedIntent): Promise<AgentResponse>;
}
