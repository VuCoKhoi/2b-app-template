import { Service } from "typedi";
import jwtDecode from "jwt-decode";
import { Shop } from "model/Shop.model";
import { ShopifyClientRepository } from "repository/ShopifyClient.repository";

export class DecodeToken {
  readonly shop: string;
  readonly accessToken: string;
  readonly _expire: number;
  readonly _maxAge: number;
}

@Service()
export class AuthService {
  constructor(
    private readonly shopifyClientRepository: ShopifyClientRepository
  ) {}
  decodeToken(token, options = {}): DecodeToken {
    const decodeToken: DecodeToken = jwtDecode(token, {
      header: true,
      ...options,
    });
    return decodeToken;
  }

  verify(decodeToken: DecodeToken): boolean {
    const { shop, accessToken, _expire } = decodeToken;
    if (!shop || !accessToken) return false;
    if (new Date(_expire) < new Date()) return false;
    return true;
  }
  async verifyAccessToken(accessToken: string, shop: string): Promise<Shop> {
    const client = this.shopifyClientRepository.createShopifyClient({
      name: shop,
      accessToken,
    });

    const shopData = await this.shopifyClientRepository.getShopInfo(client);

    return shopData as unknown as Shop;
  }
}
