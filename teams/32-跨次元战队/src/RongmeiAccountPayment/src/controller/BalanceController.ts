import {
    controller, httpPost
} from 'inversify-express-utils';
import {inject} from 'inversify';
import TYPES from '../constant/types';
import {Request} from 'express';
import {BalanceService} from "../service/BalanceService";
import {ServerResponse} from "http";
import {NearUtil} from "../util/NearUtil";
import {TransferParameter} from "../parameters/TransferParameter";
import {UserSecurityResponse} from "../response/UserSecurityResponse";
import {UserUtil} from "../util/UserUtil";
import {MintParameter} from "../parameters/MintParameter";
import {CreateAccountParameter} from '../parameters/CreateAccountParameter';
import {ThingUtil} from "../util/ThingUtil";

@controller('/balance')
export class BalanceController {

    constructor(@inject(TYPES.BalanceService) private balanceService: BalanceService) {
    }

    /**
     * help user create an near account
     * @param {e.Request} request
     * @param {"http".ServerResponse} response
     * @returns {any}
     */
    @httpPost('/account/creation')
    public async createAccount(request: Request, response: ServerResponse): Promise<any> {
        let createAccountParameter: CreateAccountParameter = request.body;

        let username: string = createAccountParameter.username;
        let accountId: string = createAccountParameter.accountId;
        try {
            const res = await NearUtil.createAccount(username, accountId, createAccountParameter.host);
            response.statusCode = 200;
            return res;
        } catch {
            response.statusCode = 405;
        }
        return null;
    }

    /**
     * help user create an ethereum account
     * @param {e.Request} request
     * @param {"http".ServerResponse} response
     * @returns {any}
     */
    @httpPost('/transfer')
    public async transfer(request: Request, response: ServerResponse): Promise<any> {
        let transferParameter: TransferParameter = request.body;
        console.log(transferParameter)

        let fromUsername: string = transferParameter.fromUsername;
        let toUsername: string = transferParameter.toUsername;
        let tokenId: number = Number(transferParameter.tokenId);
        let fromUserSecurity: UserSecurityResponse = await UserUtil.getUserSecurity(fromUsername, transferParameter.host);
        let toUserSecurity: UserSecurityResponse = await UserUtil.getUserSecurity(toUsername, transferParameter.host);
        try {
            const nearRes = await NearUtil.transfer(fromUserSecurity.nearAccountId, tokenId, toUserSecurity.nearAccountId);
            console.log(nearRes)
            if (nearRes == null) {
                response.statusCode = 500;
                return null;
            }
            const thingRes = await ThingUtil.transferThing(tokenId, fromUsername, toUsername, transferParameter.host);
            console.log(thingRes)
            if (thingRes.infoCode != 10000) {
                response.statusCode = 500;
                return null;
            }
            const res = await UserUtil.transferIMM(Number(transferParameter.totalAmount), toUsername, fromUsername, transferParameter.host);
            console.log(res)
            if (res.infoCode != 10000) {
                response.statusCode = 500;
                return null;
            }
            response.statusCode = 200;
            return res;
        } catch (error) {
            console.log(error)
            response.statusCode = 405;
        }
        return null;
    }

    /**
     * bind a account with a ethereum account
     * @param {e.Request} request
     * @param {"http".ServerResponse} response
     * @returns {any}
     */
    @httpPost('/mint')
    public async mint(request: Request, response: ServerResponse): Promise<any> {
        let mintParameter: MintParameter = request.body;
        let username: string = mintParameter.username;
        let userSecurity: UserSecurityResponse = await UserUtil.getUserSecurity(username, mintParameter.host);

        try {
            const res = await NearUtil.mint(userSecurity.nearAccountId, mintParameter.tokenId);
            console.log(res)
            response.statusCode = 200;
            return res;
        } catch {
            response.statusCode = 405;
        }
        return null;
    }
}
