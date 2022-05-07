import { CronController, Cron } from "cron-decorators";
import { ChoreService } from "services/Chore.service";
import { Service } from "typedi";

@Service()
@CronController("jobs")
export class JobController {
  constructor(private choreService: ChoreService) {}

  @Cron("sec", "*/15 * * * * *")
  public async secCronJob(): Promise<void> {
    // const result = await this.choreService.deleteAllInvoiceInVoidStatus();
    // console.log("deleted 1 invoice in void status", result);
  }
}
