import { AddToCartAgent } from './add-to-cart-agent.js';
import { AddressAgent } from './address-agent.js';
import { BundleAdvisorAgent } from './bundle-advisor-agent.js';
import { GreetingAgent } from './greeting-agent.js';
import { OrdersAgent } from './orders-agent.js';
import { PopularProductsAgent } from './popular-products-agent.js';
import { ProductSearchAgent } from './product-search-agent.js';
import { TopPicksAgent } from './top-picks-agent.js';
import type { Agent, ParsedIntent } from './types.js';
import { UnknownAgent } from './unknown-agent.js';

export interface GraphRoute {
  intent: string;
  agent: Agent;
}

export class AgentGraph {
  private readonly agents: Record<string, Agent> = {
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

  resolve(parsed: ParsedIntent): GraphRoute {
    const intent =
      parsed.isGreeting || parsed.intent === 'greeting'
        ? 'greeting'
        : parsed.intent || 'unknown';

    return {
      intent,
      agent: this.agents[intent] ?? this.agents.unknown,
    };
  }
}
