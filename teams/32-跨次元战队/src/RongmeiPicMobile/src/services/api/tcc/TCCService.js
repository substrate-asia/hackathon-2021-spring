import {httpTCC} from '../HttpService';

export class TCCServiceImpl {
    async getTCC(key) {
        return await httpTCC.get(
            `/tcc/key?key=${key}`
        )
    }
}
