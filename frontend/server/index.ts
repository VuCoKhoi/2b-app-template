require("isomorphic-fetch");
import dotenv from "dotenv";
dotenv.config();

import Koa from "koa";
import Router from "koa-router";
import next from "next";
import createShopifyAuth, { verifyRequest } from "@shopify/koa-shopify-auth";
import session from "koa-session";

const {
  PORT,
  NODE_ENV,
  SHOPIFY_API_KEY,
  SHOPIFY_API_SECRET,
  SCOPES,
  API_HOST,
} = process.env as any;

const port = PORT || 3500;
const dev = NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

// Storing the currently active shops in memory will force them to re-login when your server restarts. You should
// persist this object in your app.
const ACTIVE_SHOPIFY_SHOPS: {
  [shop: string]: string;
} = {};

const handleRequest = async (ctx: any) => {
  await handle(ctx.req, ctx.res);
  ctx.respond = false;
  ctx.res.statusCode = 200;
};

app.prepare().then(() => {
  const server = new Koa();
  const router = new Router();
  server.use(
    session({ sameSite: "none", secure: true, key: SHOPIFY_API_KEY }, server)
  );
  server.keys = [SHOPIFY_API_SECRET];
  server.use(
    createShopifyAuth({
      // your shopify app api key
      apiKey: SHOPIFY_API_KEY,
      // your shopify app secret
      secret: SHOPIFY_API_SECRET,
      scopes: SCOPES.split(","),
      accessMode: "offline",
      async afterAuth(ctx) {
        // Access token and shop available in ctx.session or ctx.state.shopify
        const { shop, scope } = ctx.state.shopify;

        ACTIVE_SHOPIFY_SHOPS[shop] = scope;

        const result = await fetch(`${API_HOST}/api/public/register`, {
          method: "POST",
          body: JSON.stringify(ctx.state.shopify),
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (result.status !== 200) {
          console.error(
            new Date().toISOString(),
            "Error when",
            shop,
            "install app",
            "\n\n\n",
            ctx.session
          );
        }
        // Redirect to app with shop parameter upon auth
        ctx.redirect(`/?shop=${shop}`);
      },
    })
  );

  //   router.post("/webhooks", async (ctx) => {
  //     try {
  //       await Shopify.Webhooks.Registry.process(ctx.req, ctx.res);
  //       console.log(`Webhook processed, returned status code 200`);
  //     } catch (error) {
  //       console.log(`Failed to process webhook: ${error}`);
  //     }
  //   });

  //   router.post(
  //     "/graphql",
  //     verifyRequest({ returnHeader: true }),
  //     async (ctx) => {
  //       await Shopify.Utils.graphqlProxy(ctx.req, ctx.res);
  //     }
  //   );

  router.get("(/_next/static/.*)", handleRequest); // Static content is clear
  router.get("/_next/webpack-hmr", handleRequest); // Webpack content is clear
  server.use(verifyRequest({}));
  server.use(handleRequest);
  // router.get("(.*)", async (ctx) => {
  // const shop = (() => {
  //   const { shop } = ctx.query;
  //   if (!shop) return undefined;
  //   if (typeof shop === "string") return shop;
  //   return shop[0];
  // })();

  // // // This shop hasn't been seen yet, go through OAuth to create a session
  // if (!shop && ACTIVE_SHOPIFY_SHOPS[shop as string] === undefined) {
  //   ctx.redirect(`/auth?shop=${shop}`);
  // } else {
  //   await handleRequest(ctx);
  // }
  // await handleRequest(ctx);
  // });

  server.listen(port, () => {
    console.log(`> Ready on http://localhost:${port}`);
  });
});
