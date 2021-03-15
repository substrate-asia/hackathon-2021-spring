import {BaseParameter} from "./BaseParameter";

export interface CreateAccountParameter extends BaseParameter {
    username: string;
    accountId: string;
}
