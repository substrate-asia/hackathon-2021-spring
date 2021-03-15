import typeconfig from "../config/typeconfig"
import Utils from "./Utils";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Net extends cc.Component {
    //初始化
    public init(pos: cc.Vec2): void {
        //设置坐标点
        this.node.setPosition(pos)
        //获取动画
        const animation: cc.Animation = this.getComponent(cc.Animation)
        //播放动画
        animation.play();
        // 动画播放完成之后移除时间和回收节点
        animation.on('finished', e => {
            Utils.putPoolNode(this.node, typeconfig.global.netPool);
            animation.off('finished');
        });
    }
}
