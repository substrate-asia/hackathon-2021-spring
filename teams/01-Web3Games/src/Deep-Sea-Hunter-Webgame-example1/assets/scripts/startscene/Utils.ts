import {FishType} from "../event";


// 公共类
export default class Utils {
    private constructor() {
    }
    // 鱼游动的贝塞尔曲线
    public static bezierArray: cc.Vec2[][] = [
        [cc.v2(50, -100), cc.v2(300, -400), cc.v2(1800, -650)],
        [cc.v2(100, -200), cc.v2(400, -300), cc.v2(1800, -600)],
        [cc.v2(150, -300), cc.v2(600, -400), cc.v2(1800, -500)],
        [cc.v2(50, 50), cc.v2(400, 100), cc.v2(1800, 200)],
        [cc.v2(80, 200), cc.v2(300, 500), cc.v2(1800, 650)],
        [cc.v2(100, 100), cc.v2(350, 400), cc.v2(1800, 500)],
        [cc.v2(100, 2), cc.v2(350, -2), cc.v2(1800, 0)]
    ]
    // 鱼的配置属性
    public static fishType: FishType[] = [
        {
            "name": "001",
            "hp": 1,
            "text":"小丑鱼"
        },
        {
            "name": "002",
            "hp": 2,
            "text":"好看鱼"
        },
        {
            "name": "003",
            "hp": 3,
            "text":"灯笼鱼"
        },
        {
            "name": "004",
            "hp": 4,
            "text":"魔鬼鱼"
        },
        {
            "name": "005",
            "hp": 5,
            "text":"大鲸鱼"
        },
        {
            "name": "006",
            "hp": 6,
            "text":"大金鱼"
        },
        {
            "name": "007",
            "hp": 7,
            "text":"大金龟"
        },
        {
            "name": "008",
            "hp": 8,
            "text":"神圣金枪鱼"
        },
        {
            "name": "009",
            "hp": 9,
            "text":"黄金河豚"
        },
        {
            "name": "010",
            "hp": 10,
            "text":"红电鱼"
        },
    ]

    /**
     * 从对象池中取节点
     * @param nodePool 节点池
     * @param prefab 预制体
     */
    public static getPoolNode(nodePool: cc.NodePool, prefab: cc.Prefab): cc.Node {
        let fish: cc.Node = null;
        //如果缓冲池数量大于0
        if (nodePool.size() > 0) {
            //从里面取一个节点
            fish = nodePool.get();
        } else {
            //克隆预制体
            fish = cc.instantiate(prefab);
        }
        //弹出鱼
        return fish;
    }

    /**
     * 把鱼放回池中
     * @param node 节点
     * @param nodePool 对象池
     */
    public static putPoolNode(node: cc.Node, nodePool: cc.NodePool): void {
        //回收鱼
        nodePool.put(node);
    }
}