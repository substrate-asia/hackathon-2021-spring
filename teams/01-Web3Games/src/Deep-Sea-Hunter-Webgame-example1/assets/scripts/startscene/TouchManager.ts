import {MyEvent} from "../event";
import {transaction} from "../config/transaction"
const {ccclass, property} = cc._decorator;


let Touch: cc.Vec2

@ccclass
export default class TouchManager extends cc.Component {


    // 炮台
    @property(cc.Node)
    weapon: cc.Node = null;

    // 上一次点击的好时间
    lastTouchTime: number = 0;


    protected onLoad(): void {
        this.node.on(cc.Node.EventType.TOUCH_START, this._touchStart, this);
    
    }
    private _touchStart(e: cc.Event.EventTouch): void {

        let data = cc.find("Canvas/shell/view").getComponent(cc.Label).string 
        let balance = Number(data.charAt(data.length-1));
        if(balance > 0){
                // 世界坐标转局部坐标
            const curTouch: cc.Vec2 = this.weapon.parent.convertToNodeSpaceAR(e.getLocation());

            const x = Math.abs(curTouch.x - this.weapon.x);
            const y = Math.abs(curTouch.y - this.weapon.y);
            const radian: number = Math.atan(x / y);
            let angle: number = cc.misc.radiansToDegrees(radian);

            if (curTouch.x > this.weapon.x && curTouch.y > this.weapon.y) {
                angle = -angle
            } else if (curTouch.x > this.weapon.x && curTouch.y < this.weapon.y) {
                angle = -(90 - angle) - 90
            } else if (curTouch.x < this.weapon.x && curTouch.y < this.weapon.y) {
                angle = (90 - angle) + 90;
            }
            this.weapon.angle = angle;
            cc.director.emit(MyEvent.SHOT_DEL);
            cc.director.emit(MyEvent.TOUCHEND_SHOOT, angle);
        }else alert('炮弹数量不足请先购买子弹');
        
    }
    // update (dt) {}
}
