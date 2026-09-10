/**
 * Shopify Storefront API GraphQL Client
 * Version: 2024-10 (pinned stable API)
 */

export const SHOPIFY_STOREFRONT_API_VERSION = '2024-10';

export interface ShopifyCartLine {
  id: string;
  quantity: number;
  merchandise: {
    id: string; // Variant GID
    title: string;
    product: {
      id: string;
      title: string;
      handle: string;
      featuredImage?: {
        url: string;
        altText?: string;
      };
    };
    price: {
      amount: string;
      currencyCode: string;
    };
  };
  attributes?: Array<{ key: string; value: string }>;
}

export interface ShopifyCart {
  id: string;
  checkoutUrl: string;
  totalQuantity: number;
  cost: {
    subtotalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalAmount: {
      amount: string;
      currencyCode: string;
    };
    totalTaxAmount?: {
      amount: string;
      currencyCode: string;
    } | null;
  };
  lines: ShopifyCartLine[];
}

export class ShopifyStorefrontClient {
  private domain: string;
  private accessToken: string;
  private endpoint: string;

  constructor() {
    this.domain = process.env.SHOPIFY_SHOP_DOMAIN || 'salud-forte.myshopify.com';
    this.accessToken = process.env.SHOPIFY_STOREFRONT_ACCESS_TOKEN || '';
    this.endpoint = `https://${this.domain}/api/${SHOPIFY_STOREFRONT_API_VERSION}/graphql.json`;
  }

  public isConfigured(): boolean {
    return Boolean(this.accessToken && !this.accessToken.includes('replace_with'));
  }

  public async query<T = unknown>(graphqlQuery: string, variables: Record<string, unknown> = {}): Promise<T> {
    if (!this.isConfigured()) {
      throw new Error('SHOPIFY_STOREFRONT_ACCESS_TOKEN is not configured');
    }

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': this.accessToken,
      },
      body: JSON.stringify({ query: graphqlQuery, variables }),
    });

    if (!res.ok) {
      throw new Error(`Shopify Storefront API error: ${res.status} ${res.statusText}`);
    }

    const json = await res.json();
    if (json.errors && json.errors.length > 0) {
      throw new Error(`Shopify GraphQL errors: ${JSON.stringify(json.errors)}`);
    }

    return json.data as T;
  }
}

export const storefrontClient = new ShopifyStorefrontClient();
