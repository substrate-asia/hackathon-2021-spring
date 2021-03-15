import {http} from '../HttpService';

export class MoneyServiceImpl {
    async recharge(params) {
        return await http.post(
            `/money/recharge`, params
        )
    }
}
