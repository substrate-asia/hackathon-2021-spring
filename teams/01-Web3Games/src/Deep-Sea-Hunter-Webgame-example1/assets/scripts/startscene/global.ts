import {connect} from "../config/chain";
import Utils from "./Utils";
import Fish from "./Fish";
import typeconfig from "../config/typeconfig"
import Bullet from "./Bullet"
import {MyEvent} from "../event";
const {ccclass, property} = cc._decorator;




@ccclass
export default class global extends cc.Component {


    // 鱼的预制体
    @property(cc.Prefab)
    fishPrefab: cc.Prefab = null;

    // 鱼游动的层
    @property(cc.Node)
    fishLayer: cc.Node = null;

    // 鱼的图集
    @property(cc.SpriteAtlas)
    fishAtlas: cc.SpriteAtlas = null;

    // 鱼网预制体
    @property(cc.Prefab)
    netPrefab: cc.Prefab = null;
    
    // 炮弹预制体
    @property(cc.Prefab)
    bulletPrefab: cc.Prefab = null;

    //炮弹图集
    @property(cc.SpriteAtlas)
    weaponAtlas: cc.SpriteAtlas = null;

    // 炮台节点
    @property(cc.Node)
    weapon: cc.Node = null;


    // 炮弹的对象池
    public bulletPool: cc.NodePool = new cc.NodePool();

    // 鱼的对象池
    public fishPool: cc.NodePool = new cc.NodePool();

    // 鱼网的对象池
    public netPool: cc.NodePool = new cc.NodePool();

    protected onLoad(){
        // 初始化数据
        typeconfig.init();
        //开启碰撞管理
        const manager: cc.CollisionManager = cc.director.getCollisionManager();
        manager.enabled = true;
        // 把当前管理类放到全局的,让属性可以被Fish所访问
        typeconfig.global = this;
        //类似于定时器再调一下
        this.schedule(this.createFish, 2);
        // 监听触摸层传过来的时间，附带角度
        cc.director.on(MyEvent.TOUCHEND_SHOOT, this.fireBullet, this);
    }

    //创建鱼
    public createFish(value:number):void {
        //鱼的数量 = 5 次脚本循环
        let fishCount: number = 5;
        //初始化鱼节点
        let fishNode: cc.Node = null;
        //循环鱼数量的脚本
        for (let i = 0; i < fishCount; i++) {
            //从对象池里取出鱼的预制体
            fishNode = Utils.getPoolNode(this.fishPool, this.fishPrefab);
            //鱼的父节点是游动的层
            fishNode.parent = this.fishLayer;
            //定义随机值的X,Y
            const x = -Math.random() * 150 - this.node.width / 2 - 100;
            const y = Math.random() * 500 - 250;
            //定义鱼的值为 0-1 * 10 换句话说随机抽数组里的一条鱼的信息
            const fishType = Utils.fishType[Math.floor(Math.random() * Utils.fishType.length)];
            //初始化鱼的信息 从X,Y坐标开始和它的信息
            fishNode.getComponent(Fish).init(x, y, fishType);
        }
    }

    /**
     * 发射炮弹
     * @param angle 炮弹的角度
     */
    //开炮附带角度参数
    public fireBullet(angle): void {
        //从炮弹对象池取出炮弹预制体
        const bullet: cc.Node = Utils.getPoolNode(this.bulletPool, this.bulletPrefab);
        //炮弹图层在鱼下面
        bullet.parent = this.fishLayer;
        //获取本节点的Bullet组件并初始化附带角度参数
        bullet.getComponent(Bullet).init(angle);
    }

    // update (dt) {}
}

