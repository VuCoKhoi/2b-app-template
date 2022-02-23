import { omitBy, isNil } from "lodash";

async function handleError(ctx: any, next: any) {
  try {
    await next();
  } catch (err) {
    const { path, method } = ctx;
    const {
      status = 500,
      message = "Internal Server Error",
      requireAuth,
      shouldRefresh,
    } = err;

    console.log("\nERROR", `${method} ${path} - ${status} ${err.message}\n`);

    const errData = omitBy(
      { status, message, requireAuth, shouldRefresh },
      isNil
    );
    ctx.send(status, { success: 0, ok: false, ...errData });
  }
}

module.exports = handleError;
