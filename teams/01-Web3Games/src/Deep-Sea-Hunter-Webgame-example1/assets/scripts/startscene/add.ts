import {MyEvent} from "../event";
import {transaction} from "../config/transaction"

const {ccclass, property} = cc._decorator;


@ccclass
export default class add extends cc.Component {

    protected onLoad(): void {

    }

    private addbalance(){
        transaction()
    }
}



