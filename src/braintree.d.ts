declare module 'braintree-web-drop-in' {
  export interface PaymentMethodPayload {
    nonce: string;
    type: string;
    details: Record<string, any>;
    description: string;
  }

  export interface Dropin {
    on(event: string, callback: Function): void;
    requestPaymentMethod(callback: (error: Error | null, payload: PaymentMethodPayload) => void): void;
    teardown(callback: (error: Error | null) => void): void;
  }

  export interface DropinOptions {
    authorization: string;
    container: string | HTMLElement;
    dataCollector?: {
      kount?: boolean;
    };
    paypal?: {
      flow: string;
      amount?: number | string;
      currency?: string;
      buttonStyle?: Record<string, any>;
    };
    venmo?: {
      allowNewBrowserTab?: boolean;
    };
    card?: {
      cardholderName?: boolean | {
        required?: boolean;
      };
    };
  }

  export function create(
    options: DropinOptions,
    callback: (error: Error | null, instance: Dropin) => void
  ): void;
}
