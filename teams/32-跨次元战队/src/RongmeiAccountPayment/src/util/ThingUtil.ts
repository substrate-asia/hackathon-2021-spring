import {httpMall} from "./HttpService";
import {SuccessResponse} from "../response/SuccessResponse";

export class ThingUtil {
    static async transferThing(tokenId, fromUsername, toUsername, hostname): Promise<SuccessResponse> {
        return await httpMall.post('auction/thing/transfer/inner', {
            tokenId,
            fromUsername,
            toUsername,
            hostname
        })
    }
}
