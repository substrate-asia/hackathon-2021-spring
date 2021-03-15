import {MyEvent} from "../event";
import {returnbalance} from './return'
import {connect} from "../config/chain";

const {ccclass, property} = cc._decorator;

let value:number = 0

@ccclass
export default class shellbalance extends cc.Component {
    protected onLoad(){
        cc.director.on(MyEvent.DEL_START,this.extract,this);
        cc.director.on(MyEvent.ADD_SHELL,this.updatebalance,this);
        cc.director.on(MyEvent.DEL_SHELL,this.declare,this);
        cc.director.on(MyEvent.SHOT_DEL,this.shotdeclare,this);
    }


    private updatebalance (){
        value ++;
        this.node.getComponent(cc.Label).string = `当前剩余炮弹数量为${value}`;
        this.updateaddsgc()

    }

    private extract(){
        let data = this.node.getComponent(cc.Label).string;
        let balance = Number(data.charAt(data.length-1));
        if (balance > 0 ){
            returnbalance()
        }
        else alert('余额不足无法提币');
    }

    private declare(){
        value --;
        this.node.getComponent(cc.Label).string = `当前剩余炮弹数量为${value}`
        connect().then(vaule =>{this.updatesgc(vaule);});
        
    }

    private shotdeclare(){
        value --;
        this.node.getComponent(cc.Label).string = `当前剩余炮弹数量为${value}`
    }


    private updatesgc (vaule:String){
        let data = vaule.substring(0,vaule.length-18)
        cc.find("Canvas/coinshow/balance").getComponent(cc.Label).string = '您当前DSH余额为' + data
        alert('提币成功');
    }

    private updateaddsgc(){
        connect().then(vaule =>{this.updatefinall(vaule);});
    }

    private updatefinall(vaule:string){
        let data = vaule.substring(0,vaule.length-18)
        cc.find("Canvas/coinshow/balance").getComponent(cc.Label).string = '您当前DSH余额为' + data
        alert('投币成功');
    }
}


