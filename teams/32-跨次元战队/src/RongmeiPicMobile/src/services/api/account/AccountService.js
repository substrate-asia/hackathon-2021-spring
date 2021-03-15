import {httpCommon} from "../HttpService";

export class AccountServiceImpl {
    async login(loginData) {
        return await httpCommon.get(
            '/account', loginData
        )
    }

    async sendCaptcha(captchaData) {
        return await httpCommon.get(
            '/account/captcha', captchaData
        )
    }

    async saveUserInfo(data) {
        return await httpCommon.post(
            '/account/info', data
        )
    }

    async getUserInfo() {
        return await httpCommon.get(
            `/account/info`
        )
    }

    async getUserBase() {
        return await httpCommon.get(
            `/account/user/base`
        )
    }

    async getUserBasisSecurity() {
        return await httpCommon.get(
            `/user_security/basis`
        )
    }

    async getUserAccount() {
        return await httpCommon.get(
            `/user_account`
        )
    }

    async updateUserAccount(userAccountData) {
        return await httpCommon.post(
            `/user_account`, userAccountData
        )
    }

    async getUserInfoEntity(username) {
        return await httpCommon.get(
            `/account/info/entity?username=${username}`
        )
    }

    async payEarnest(totalAmount) {
        return await httpCommon.get(
            `/pay/transfer/earnest?total_amount=${totalAmount}`
        )
    }

    async postAlipay(totalAmount, returnUrl) {
        return await httpCommon.post(
            `/pay/alipay`, {
                payType: 0,
                returnUrl: returnUrl,
                totalAmount: totalAmount
            }
        )
    }

    async consumeDiscount(totalAmount) {
        return await httpCommon.get(`/pay/discount?total_amount=${totalAmount}`)
    }
}
