export type PaymentInput = {
  orderId: string;
  amount: number;
  currency: string;
};

export type PaymentResult = {
  providerPaymentId: string;
  status: 'pending' | 'succeeded' | 'failed';
};

export interface PaymentProvider {
  createPayment(input: PaymentInput): Promise<PaymentResult>;
  verifyWebhook(payload: string, signature: string): Promise<boolean>;
}

export class MockPaymentProvider implements PaymentProvider {
  private assertDevelopment() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MockPaymentProvider cannot run in production');
    }
  }

  async createPayment(_input: PaymentInput): Promise<PaymentResult> {
    this.assertDevelopment();
    return {
      providerPaymentId: crypto.randomUUID(),
      status: 'succeeded',
    };
  }

  async verifyWebhook(_payload: string, _signature: string) {
    this.assertDevelopment();
    return true;
  }
}

export class StripePaymentProvider implements PaymentProvider {
  async createPayment(_input: PaymentInput): Promise<PaymentResult> {
    throw new Error('Stripe is not configured');
  }

  async verifyWebhook(_payload: string, _signature: string): Promise<boolean> {
    throw new Error('Stripe is not configured');
  }
}
