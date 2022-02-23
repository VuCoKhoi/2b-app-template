import { CronController, Cron } from "cron-decorators";
import { XlsxService } from "services/Xlsx.service";
import { Service } from "typedi";

@Service()
@CronController("jobs")
export class JobController {
  constructor(private readonly xlsxService: XlsxService) {}
  @Cron("sec", "*/10 * * * * *")
  public async secCronJob(): Promise<void> {
    // this.xlsxService.createFile([[1]], "test");
  }
}
