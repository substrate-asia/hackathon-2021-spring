// 鱼的类型属性
export interface FishType {
    name: string,
    hp: number,
    text:string
}

/** 导出事件名称枚举 */
export enum MyEvent {
    //打出炮弹余额
    SHOT_DEL = 'SHOTDEL',
    //减少炮弹
    DEL_START = 'STARTDEL',
    //炮弹减少成功
    DEL_SHELL = 'del',
    //炮弹增加成功
    ADD_SHELL = 'add',
    /** 触摸结束后，射击事件，附带角度参数 */
    TOUCHEND_SHOOT = 'shoot'
}
