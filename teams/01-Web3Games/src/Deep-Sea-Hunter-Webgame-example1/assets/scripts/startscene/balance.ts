import {connect} from "../config/chain";
import {MyEvent} from "../event";
const {ccclass, property} = cc._decorator;

@ccclass
export default class balance extends cc.Component {

    
    
    protected onLoad(){
        this.getbalance()
    }


    private updatebalance (vaule:String){
        let data = vaule.substring(0,vaule.length-18)
        this.node.getComponent(cc.Label).string = '您当前DSH余额为' + data
        
    }

    private getbalance(){
        connect().then(vaule =>{this.updatebalance(vaule);});
    }

}

