import typeconfig from "../config/typeconfig"
import Utils from "./Utils";
import Net from "./Net";
import Fish from "./Fish";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Bullet extends cc.Component {

    @property(cc.Integer)
    speed: number = 500;

    // 旋转弧度
    radian: number = 0;

    // 子弹反弹次数
    bounceCount: number;

    // 方向
    direction: number;

    /**
     * 初始化炮弹
     * @param angle 炮弹的角度
     */
    public init(angle: number): void {
        //炮弹数量+1
        typeconfig.bulletCount++;
        //方向为1
        this.direction = 1;
        //子弹反弹次数为2
        this.bounceCount = 2;
        // 角度转弧度
        this.radian = cc.misc.degreesToRadians(angle);
        // 把炮台的坐标转换成世界坐标，再转换成局部坐标
        const worldV2: cc.Vec2 = typeconfig.global.weapon.parent.convertToWorldSpaceAR(typeconfig.global.weapon.getPosition());
        const v2: cc.Vec2 = this.node.parent.convertToNodeSpaceAR(worldV2);
        // 用三角函数求出目标位置点   角度相反
        const targetPos: cc.Vec2 = cc.v2(v2.x + 10 * -Math.sin(this.radian), v2.y + 10 * Math.cos(this.radian));
        this.node.setPosition(targetPos);
        this.node.angle = angle;
    }

    /**
     * 碰撞检测
     * @param other 其他碰撞组件
     * @param self 当前碰撞组件
     */
    private onCollisionEnter(other: cc.Collider, self: cc.Collider): void {
        // 如果鱼已经死亡，则不再检测碰撞
        if (!other.node.getComponent(Fish).isLive) return;
        //把此这炮弹回收到对象池里
        Utils.putPoolNode(this.node, typeconfig.global.bulletPool);
        //从渔网的对象池里取出渔网预制体
        const net: cc.Node = Utils.getPoolNode(typeconfig.global.netPool, typeconfig.global.netPrefab);
        //渔网图层在鱼层下面
        net.parent = typeconfig.global.fishLayer;
        //获取渔网组件并初始化坐标
        net.getComponent(Net).init(this.node.getPosition());
        //炮弹数量-1
        typeconfig.bulletCount--;
    }

    //每一帧更新
    protected update(dt: number): void {
        //dx为此节点X坐标，dy为Y坐标
        let dx: number = this.node.x;
        let dy: number = this.node.y;

        // console.log(dx,cc.winSize.width/2)

        //如果炮弹数量>0
        if (this.bounceCount > 0) {
            if (Math.abs(dx) > cc.winSize.width / 2) {
                // 如果超出横向屏幕，则旋转他们的角度和弧度
                this.radian = -this.radian;
                this.node.angle = -this.node.angle;
                this.bounceCount--;
            } else if (dy > cc.winSize.height / 2) {
                // y轴方向需要旋转180度
                this.node.angle = 180 - this.node.angle;
                this.direction = -1;
                this.bounceCount--;
            } else if (dy < -cc.winSize.height / 2) {
                // y轴方向需要旋转180度
                this.node.angle = 180 - this.node.angle;
                this.direction = -1;
                this.bounceCount--;
            }
        }
        dx -= this.speed * dt * Math.sin(this.radian);
        dy += this.speed * dt * Math.cos(this.radian) * this.direction;
        this.node.setPosition(cc.v2(dx, dy));

        // 溢出屏幕之后回收炮弹
        if ((Math.abs(dx) - cc.winSize.width / 2 > 100) || (Math.abs(dy) - cc.winSize.height / 2 > 100)) {
            //把炮弹放回炮弹对象池
            Utils.putPoolNode(this.node, typeconfig.global.bulletPool);
            //炮弹数量减一
            typeconfig.bulletCount--;
        }
    }

    // 获取炮弹的伤害
    public getHurt(): number {
        //伤害值为武器等级*2 
        let hurt = typeconfig.weaponLevel * 5;
        //返回大于或等于其数字参数的最小整数
        //距离 如果math.random 为1 那么 最大伤害为 1+ 如果武器等级为5 那么= 1+2=3
        //此次伤害为3
        return Math.ceil(Math.random() * hurt + typeconfig.weaponLevel);
    }
}
