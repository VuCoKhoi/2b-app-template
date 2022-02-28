import {
  ExpressMiddlewareInterface,
  UnauthorizedError,
  createParamDecorator,
  UseBefore,
} from "routing-controllers";
import { ShopService } from "services/Shop.service";
import { Shop } from "model/Shop.model";
import { Service } from "typedi";
import * as cookieParser from "cookie-parser";
import { AuthService } from "services/Auth.service";

@Service()
@UseBefore(cookieParser)
export class VerifyRequestMiddleware implements ExpressMiddlewareInterface {
  constructor(
    private shopService: ShopService,
    private authService: AuthService
  ) {}

  async use(req: any, res: any, next?: (err?: any) => any): Promise<any> {
    try {
      const decodeToken = this.authService.decodeToken(
        req.cookies[process.env.SHOPIFY_API_KEY]
      );

      if (this.authService.verify(decodeToken)) {
        req.shop = await this.shopService.findOne({
          myshopify_domain: decodeToken.shop,
        });

        next();
      } else {
        throw new UnauthorizedError();
      }
    } catch (error) {
      throw new UnauthorizedError(error);
    }
  }
}

export function ShopFromRequest(options?: { required?: boolean }) {
  return createParamDecorator({
    required: options && options.required ? true : false,
    value: (action) => {
      return action.request.shop;
    },
  });
}
