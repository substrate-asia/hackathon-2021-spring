import {BaseParameter} from "./BaseParameter";

export interface TransferParameter extends BaseParameter {
    tokenId: number;
    totalAmount: number;
    fromUsername: string;
    toUsername: string;
}
