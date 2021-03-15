import {httpBalance, httpCommon} from "../HttpService";

export class BalanceServiceImpl {
    async createAccount(username, accountId) {
        return await httpBalance.post(
            '/balance/account/creation', {
                username,
                accountId,
                host: window.location.href
            }
        )
    }

    async login(loginData) {
        return await httpCommon.get(
            '/account', loginData
        )
    }

    async transfer(fromUsername, toUsername, tokenId) {
        return await httpBalance.post(
            '/balance/transfer', {
                fromUsername,
                toUsername,
                tokenId,
                totalAmount: 0,
                host: window.location.href
            }
        )
    }
}
