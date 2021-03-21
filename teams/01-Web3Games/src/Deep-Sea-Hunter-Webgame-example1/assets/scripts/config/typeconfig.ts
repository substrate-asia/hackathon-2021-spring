import global from '../startscene/global'

// 全局的数据
export default class typeconfig {
    private constructor() {
    }

    public static weaponLevel: number;

    // 拥有的金币数量
    public static hasGold: number;

    // 金币数量管理
    public static NumControl: number;

    // 当前存在的炮弹数量
    public static bulletCount: number;

    // 全局的游戏管理
    public static global: global;

    public static init(): void {
        // 炮台的等级
        typeconfig.weaponLevel = 1;

        // 拥有的金币数量
        typeconfig.hasGold = 10000;

        // 当前存在的炮弹数量
        typeconfig.bulletCount = 0;
    }
}