import React, {Component} from 'react';
import logo from "../../images/logo.svg";
import {Image} from "antd";
import BottomHeaterCSS from './BottomHeater.module.css'

const copyright = "© 2021 DeepSeaHunter"
const statement = "《深海猎手》全部背景故事发生于架空世界“欧罗巴星”中。相关人物、地理、事件均为艺术创作，并非事实。若玩游戏对欧罗巴星产生兴趣，建议查阅维基百科。"


class BottomHeater extends Component {
    render() {
        return (
            <div className={BottomHeaterCSS.BottomHeater}>
                <Image style={{marginTop:'50px',marginLeft:'170px'}} width={200} height={84} preview={false} src={logo}/>
                <h2 className={BottomHeaterCSS.Copyright}>{copyright}</h2>
                <h2 className={BottomHeaterCSS.Statement}>抵制不良游戏   拒绝盗版游戏  注意自我保护  谨防受骗上当  适度游戏益脑  沉迷游戏伤身  合理安排时间  享受健康生活</h2>
                <h2 className={BottomHeaterCSS.GameStatement}>{statement}</h2>
                <h2 className={BottomHeaterCSS.ContractUs}>联系我们</h2>
                <h2 className={BottomHeaterCSS.BlogRoll}>相关链接</h2>
            </div>
        );
    }
}

export default BottomHeater;
