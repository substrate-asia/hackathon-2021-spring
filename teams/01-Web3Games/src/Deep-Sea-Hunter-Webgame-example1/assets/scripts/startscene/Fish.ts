import {FishType} from "../event";
import Utils from "./Utils";
import typeconfig from "../config/typeconfig"
import Bullet from "./Bullet"
import {getfish} from './getfish'
const {ccclass, property} = cc._decorator;

@ccclass
export default class Fish extends cc.Component {

    

    // 上一次的位置
    lastPos: cc.Vec2 = null;

    // 鱼的生命值
    hp: number = 0;

    // 鱼的状态
    isLive: boolean = true;

    // 动画组件
    anim: cc.Animation = null;

    // 鱼的类型属性
    fishType: FishType = null;
    /**
     * 格式化节点
     * @param x x轴位置
     * @param y y轴位置
     * @param fishType 鱼的类型
     */
    public init(x: number, y: number, fishType: FishType): void {
        //此节点上的精灵组件=图集里的精灵
        this.node.getComponent(cc.Sprite).spriteFrame = typeconfig.global.fishAtlas.getSpriteFrame("fishMove_" + fishType.name + "_01")
        this.fishType = fishType;
        this.isLive = true;
        // 初始化鱼的血量
        this.hp = fishType.hp;
        // 设置碰撞盒子的大小是图形本身尺寸
        this.getComponent(cc.BoxCollider).size = this.node.getContentSize();
        //设置向量
        const v2: cc.Vec2 = cc.v2(x, y)
        //设置坐标点
        this.node.setPosition(v2);
        this.lastPos = v2;
        //获取此节点上的动画组件
        this.anim = this.node.getComponent(cc.Animation);
        //播放动画名字为fishMove加编号如001
        this.anim.play('fishMove' + fishType.name);
        // 随机游动时长
        const rmdTime: number = Math.random() * 10 + 8;
        // 随机贝塞尔曲线
        const rmdBezier: cc.Vec2[] = Utils.bezierArray[Math.floor(Math.random() * Utils.bezierArray.length)];
        // 停止上次正在运行的动作列表
        this.node.stopAllActions();
        // 附加节点
        cc.tween(this.node)
            //停止
            .stop()
            //游动轨迹
            .then(cc.bezierBy(rmdTime, rmdBezier))
            //开始
            .start();
    }

    /**
     * 碰撞检测
     * @param other 其他碰撞组件
     * @param self 当前碰撞组件
     */
    private onCollisionEnter(other: cc.Collider, self: cc.Collider): void {
        // 如果鱼已经死亡，则不再检测碰撞
        if (!this.isLive) return;
        const hurt = other.node.getComponent(Bullet).getHurt();
        this.hp -= hurt;
        if (this.hp <= 0) {
            this.isLive = false;
            // 停止移动
            this.node.stopAllActions();
            //播放动画
            this.anim.play('fishDead' + this.fishType.name);
            //把鱼放回对象池
            Utils.putPoolNode(this.node, typeconfig.global.fishPool);
            let data = this.fishType.text
            this.idcheck(data)
        }
    }

    public update(dt: number): void {
        //获取坐标
        const curPos: cc.Vec2 = this.node.getPosition();
        // 如果两次位置的距离小于1，则不做任何操作
        if (curPos.sub(this.lastPos).mag() < 1) return;
        const x = curPos.x - this.lastPos.x;
        const y = curPos.y - this.lastPos.y;
        this.lastPos = curPos;
        const offsetWidth: number = this.node.width / 2 + 50;
        const offsetHeight: number = this.node.height / 2 + 50;
        // 超出边界移除
        if (this.node.x > (cc.winSize.width / 2 + offsetWidth) || (this.node.y > cc.winSize.height / 2 + offsetHeight) || (this.node.y < -cc.winSize.height / 2 - offsetHeight)) {
            Utils.putPoolNode(this.node, typeconfig.global.fishPool)
        }
    }

    private idcheck(data:string){
        let text = "恭喜你捕获到这条" + data + "请前往区块链浏览器查看"
        switch(data){
            case '小丑鱼':
                getfish(2)
                break;
            case '好看鱼':
                getfish(3)
                break;
            case '灯笼鱼':
                getfish(4)
                break;
            case '魔鬼鱼':
                getfish(5)
                break;
            case '大鲸鱼':
                getfish(6)
                break;
            case '大金鱼':
                getfish(7)
                break;
            case '大金龟':
                getfish(8)
                break;
            case '神圣金枪鱼':
                getfish(9)
                break;
            case '黄金河豚':
                getfish(10)
                break;
            case '红电鱼':
                getfish(11)
                break;    
        }
        // switch(data){
        //     case '小丑鱼':
        //         getfish(12)
        //         break;
        //     case '好看鱼':
        //         getfish(12)
        //         break;
        //     case '灯笼鱼':
        //         getfish(12)
        //         break;
        //     case '魔鬼鱼':
        //         getfish(12)
        //         break;
        //     case '大鲸鱼':
        //         getfish(12)
        //         break;
        //     case '大金鱼':
        //         getfish(12)
        //         break;
        //     case '大金龟':
        //         getfish(12)
        //         break;
        //     case '神圣金枪鱼':
        //         getfish(12)
        //         break;
        //     case '黄金河豚':
        //         getfish(12)
        //         break;
        //     case '红电鱼':
        //         getfish(12)
        //         break;    
        // }
        alert(text)
    }
}