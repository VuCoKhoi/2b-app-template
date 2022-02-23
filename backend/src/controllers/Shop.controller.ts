import { JsonController, Get, UseBefore } from "routing-controllers";
import { Service } from "typedi";
import { ShopService } from "services/Shop.service";
import { Shop } from "model/Shop.model";
import {
  ShopFromRequest,
  VerifyRequestMiddleware,
} from "middlewares/verifyRequest";

@Service()
@UseBefore(VerifyRequestMiddleware)
@JsonController("/shop")
export class ShopController {
  constructor(private shopService: ShopService) {}

  @Get("/my")
  async getShop(
    @ShopFromRequest({ required: true }) shop: Shop
  ): Promise<Shop> {
    return shop;
  }
}
