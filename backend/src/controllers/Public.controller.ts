import { JsonController, Get, Param, Delete } from "routing-controllers";
import { Service } from "typedi";
import { checkRootDiskSpace, formatBytes } from "shares/utils/check-disk-space";
import { ChoreService } from "services/Chore.service";
import { TestModel } from "model/aliphia/Test.model";

@Service()
@JsonController("/public/")
export class PublicController {
  constructor(private choreService: ChoreService) {}

  @Get("test")
  async test() {
    return await TestModel.findOneAndUpdate(
      {},
      { $min: { a: 0 } },
      { upsert: true, new: true }
    ).lean();
  }

  @Get("companies")
  async getAllAliCompany() {
    return await this.choreService.upsertCompany();
  }

  @Get("invoices")
  async getAllAliInvoice() {
    // companyId 7
    return await this.choreService.getAllInvoices();
  }

  @Delete("invoice/:id")
  async deleteInvoice(@Param("id") id: string) {
    // companyId 7
    this.choreService.aliphiaRepository.initFetch(7);

    return await this.choreService.deleteInvoice(Number(id));
  }

  @Get()
  async getDiskSpace() {
    const { diskPath, free, size } = await checkRootDiskSpace("/");

    return { diskPath, free: formatBytes(free), size: formatBytes(size) };
  }
}
