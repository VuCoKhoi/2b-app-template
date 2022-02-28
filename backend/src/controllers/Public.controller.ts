import {
  JsonController,
  Post,
  Body,
  UnauthorizedError,
  Get,
} from "routing-controllers";
import { Service } from "typedi";
import { Shop } from "model/Shop.model";
import { ShopService } from "services/Shop.service";
import { AuthService } from "services/Auth.service";
import { checkRootDiskSpace, formatBytes } from "shares/utils/check-disk-space";
import { ReportService } from "services/Report.service";

@Service()
@JsonController("/public")
export class PublicController {
  constructor(
    private authService: AuthService,
    private shopService: ShopService,
    private reportService: ReportService
  ) {}

  @Get()
  async test() {
    return await this.reportService.makeReport();
  }

  @Get("/disk")
  async diskCheck() {
    const { diskPath, free, size } = await checkRootDiskSpace("/");
    return { diskPath, free: formatBytes(free), size: formatBytes(size) };
  }

  @Post("/register")
  async createShop(
    @Body() data: { accessToken: string; shop: string }
  ): Promise<Shop> {
    try {
      const { accessToken, shop } = data;
      const shopData = await this.authService.verifyAccessToken(
        accessToken,
        shop
      );
      return await this.shopService.createShop({ ...shopData, accessToken });
    } catch (error) {
      throw new UnauthorizedError(error);
    }
  }
}
