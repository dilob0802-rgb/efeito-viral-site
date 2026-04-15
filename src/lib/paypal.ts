import checkoutNodeJssdk from '@paypal/checkout-server-sdk';

const clientId = process.env.PAYPAL_CLIENT_ID!;
const clientSecret = process.env.PAYPAL_CLIENT_SECRET!;
const env = process.env.PAYPAL_ENV === 'production' 
  ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
  : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);

export const paypalClient = new checkoutNodeJssdk.core.PayPalHttpClient(env);
