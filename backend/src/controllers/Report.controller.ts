import {
  JsonController,
  Get,
  UseBefore,
  QueryParam,
  Post,
  Delete,
  Param,
} from "routing-controllers";
import { Service } from "typedi";
import { ReportService } from "services/Report.service";
import { VerifyRequestMiddleware } from "middlewares/verifyRequest";
import { CronService } from "services/Cron.service";

@Service()
@UseBefore(VerifyRequestMiddleware)
@JsonController("/report")
export class ReportController {
  constructor(
    private reportService: ReportService,
    private cronService: CronService
  ) {}

  @Get("/histories")
  async getReport(
    @QueryParam("limit", { type: Number }) limit: number,
    @QueryParam("offset", { type: Number }) offset: number
  ) {
    return await this.reportService.getReportHistories(
      offset || 0,
      limit || 10
    );
  }

  @Post("")
  async exportReport() {
    await this.cronService.aggragteProductVariants();
    await this.cronService.aggregateOrderItems();
    return await this.reportService.makeReport(false);
  }

  @Delete("/:fileName")
  async deleteReport(@Param("fileName") fileName: string) {
    return await this.reportService.deleteReport(fileName);
  }
}
