import "shares/setups";
import * as expressListRoutes from "express-list-routes";
import { useContainer, useExpressServer } from "routing-controllers";
import {
  useContainer as useCronContainer,
  registerController as registerCronController,
} from "cron-decorators";
import { Container } from "typedi";
import * as morgan from "morgan";
import * as express from "express";
import * as cookieParser from "cookie-parser";
import * as bodyParser from "body-parser";
import { PublicController } from "./controllers/Public.controller";
import { ShopController } from "./controllers/Shop.controller";
import { JobController } from "controllers/Job.controller";

/**
 * Setup routing-controllers to use typedi container.
 */
useCronContainer(Container);
if (process.env.ENABLE_CRON_JOBS == "true")
  registerCronController([JobController]);

useContainer(Container);

const expressApp = express();

// logger
expressApp.use(
  morgan(":method :url :status :res[content-length] - :response-time ms")
);

expressApp.use(cookieParser());
// parse application/x-www-form-urlencoded
expressApp.use(bodyParser.urlencoded({ extended: false, limit: "10mb" }));

// parse application/json
expressApp.use(bodyParser.json({ limit: "10mb" }));

// statics
expressApp.use("/api/statics", express.static("statics"));

/**
 * We create a new express server instance.
 * We could have also use useExpressServer here to attach controllers to an existing express instance.
 */

useExpressServer(expressApp, {
  defaultErrorHandler: false,
  routePrefix: "api",
  controllers: [ShopController, PublicController],
});

/**
 * Start the express app.
 */

const port = process.env.PORT || 3001;
expressApp.listen(port);

expressListRoutes(expressApp);

console.log(`Server is up and running at port ${port}`);

// error handle

expressApp.use((error, req, res, next) => {
  console.log("Error Handling Middleware called", error);
  res.status(error?.httpCode || 500).send(error);
});
