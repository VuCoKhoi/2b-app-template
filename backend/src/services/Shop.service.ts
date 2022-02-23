import { Shop, ShopModel } from "model/Shop.model";
import { Service } from "typedi";

@Service()
export class ShopService {
  async createShop(data: Shop) {
    return await ShopModel.findOneAndUpdate(
      { myshopify_domain: data.myshopify_domain },
      { ...data },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  async findOne(query: Partial<Shop>) {
    return await ShopModel.findOne({ ...query }).lean();
  }
}
