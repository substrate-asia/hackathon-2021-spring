import {provide, inject} from '../ioc/ioc';
import TYPES from '../constant/types';

@provide(TYPES.BalanceService)
export class BalanceService {

    constructor() {
    }
}
