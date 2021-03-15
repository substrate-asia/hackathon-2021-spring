import {MyEvent} from '../event'
const {ccclass, property} = cc._decorator;

@ccclass
export default class del extends cc.Component {

    protected onLoad(): void {
    }

    private delbalance(){
        cc.director.emit(MyEvent.DEL_START);
    }
}



