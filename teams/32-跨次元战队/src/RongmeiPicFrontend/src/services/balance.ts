import request from "@/utils/request";
import {ETH_SERVICE} from "@/services/config";

export async function createAccount(username: string, accountId: string) {
  return request(ETH_SERVICE, `balance/account/creation`, {
    method: 'POST',
    data: {
      username,
      accountId,
      host: window.location.href
    }
  });
}

export async function transfer(fromUsername: string, toUsername: string, tokenId: number) {
  return request(ETH_SERVICE, `balance/transfer`, {
    method: 'POST',
    data: {
      fromUsername,
      toUsername,
      tokenId,
      totalAmount: 0,
      host: window.location.href
    }
  });
}

export async function mint(username: string, tokenId: number) {
  return request(ETH_SERVICE, `balance/mint`, {
    method: 'POST',
    data: {
      username,
      tokenId,
      host: window.location.href
    }
  });
}
