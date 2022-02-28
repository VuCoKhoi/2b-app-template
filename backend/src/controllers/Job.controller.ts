import { TZ_NAME } from "contants";
import { CronController, Cron } from "cron-decorators";
import { CronService } from "services/Cron.service";
import { ReportService } from "services/Report.service";
import { XlsxService } from "services/Xlsx.service";
import { Service } from "typedi";

@Service()
@CronController("jobs")
export class JobController {
  constructor(
    private readonly xlsxService: XlsxService,
    private readonly reportService: ReportService,
    private readonly cronService: CronService
  ) {}
  @Cron("aggragate", "*/5 * * * *", {
    timeZone: TZ_NAME,
    runOnInit: true,
  })
  public async aggregateDataCronJob(): Promise<void> {
    console.log("aggregateDataCronJob start: ", new Date().toISOString());
    await this.cronService.aggragteProductVariants();
    await this.cronService.aggregateOrderItems();
    console.log("aggregateDataCronJob finish: ", new Date().toISOString());
  }

  @Cron("create-report", "0 0 * * *", {
    // run every day at midnight
    timeZone: TZ_NAME,
    runOnInit: false,
  })
  public async createReportCronJob(): Promise<void> {
    await this.reportService.makeReport();
  }
}
