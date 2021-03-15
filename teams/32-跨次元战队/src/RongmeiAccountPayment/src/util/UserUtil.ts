import {httpCommon} from "./HttpService";
import {UserSecurityResponse} from "../response/UserSecurityResponse";
import {SuccessResponse} from "../response/SuccessResponse";

export class UserUtil {
    static async getUserSecurity(username, hostname): Promise<UserSecurityResponse> {
        return await httpCommon.get('user_security/inner', {username, hostname})
    }

    static async updateUserSecurity(username, nearAccountId, nearPublicKey, nearPrivateKey, hostname): Promise<SuccessResponse> {
        return await httpCommon.post('user_security/inner', {
            username,
            nearAccountId,
            nearPublicKey,
            nearPrivateKey,
            hostname
        })
    }

    static async transferIMM(totalAmount, fromUsername, toUsername, hostname): Promise<SuccessResponse> {
        return await httpCommon.get('pay/transfer/inner', {
            total_amount: totalAmount,
            from_username: fromUsername,
            to_username: toUsername,
            hostname: hostname
        })
    }
}
