import axios from 'axios';
import {config} from './config/config'




const {ccclass, property} = cc._decorator;
@ccclass
export default class startgame extends cc.Component {

    @property(cc.EditBox)
    username: cc.EditBox = null;

    @property(cc.EditBox)
    password: cc.EditBox = null;


    


    // LIFE-CYCLE CALLBACKS:

    protected onLoad (): void {
        //翻转屏幕
        cc.view.setOrientation(cc.macro.ORIENTATION_LANDSCAPE)
    }

    public onClick(): void {
        
        let data = {
            // "phone_number":this.username.string,
            "username":this.username.string,
            "password":this.password.string
        }

        axios({
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'post',
            url: config.reqUrl + '/login-game',
            data: JSON.stringify(data)
        }).then(function (response) {
                cc.director.loadScene('start');
            })
            .catch(function (error) {
                alert('对不起，您的账号密码不对请重新输入')
                console.log(error);
            });
    }
    // update (dt) {}
}

