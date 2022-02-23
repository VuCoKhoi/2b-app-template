import * as crypto from "crypto";

export async function verifyShopifyWebhooks(ctx: any, next: any) {
  try {
    const topic = ctx.request.headers["x-shopify-topic"];
    const shop = ctx.request.headers["x-shopify-shop-domain"];
    const hmac = ctx.request.headers["x-shopify-hmac-sha256"];

    const data = ctx.request.rawBody;
    let error = "";
    let verified = false;

    if (!hmac || !shop || !topic) {
      error = "Webhook must originate from Shopify!";
    }

    if (!error) {
      const genHash = crypto
        .createHmac("sha256", process.env.SHOPIFY_API_SECRET)
        .update(data)
        .digest("base64");
      verified = genHash === hmac;
      if (!verified) error = "Couldn't verify incomming Webhook request!";
    }

    if (error) throw error;
    ctx.shop = shop;
  } catch (err) {
    ctx.throw(err.status || 401, err?.message || err);
  }
  await next();
}
