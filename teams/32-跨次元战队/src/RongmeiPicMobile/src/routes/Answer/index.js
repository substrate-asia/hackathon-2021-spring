import React from 'react'
import './index.css'
import Header from '../../components/Header/index'
import {WhiteSpace, WingBlank, Progress, Button, Modal, Toast} from 'antd-mobile';
import ask from '../../assets/ask.png';
import {api} from "../../services/api/ApiProvider";

class Answer extends React.Component {
    examService = api.examService;

    state = {
        point: 0,
        answer: [[]],
        question: [{
            question: '',
            option: [],
            key: '',
            type: 'single'
        }],
        index: 0,
        correctNum: 0,
        isNotificationModalShow: false
    }

    async componentDidMount() {
        const generateRes = await this.examService.getGenerateExercise(12);
        const exerciseWithoutAnswerItemList = generateRes.exerciseWithoutAnswerItemList;
        for (let i = 0; i < exerciseWithoutAnswerItemList.length; i++) {
            exerciseWithoutAnswerItemList[i].option = exerciseWithoutAnswerItemList[i].selections.split(' ');
            exerciseWithoutAnswerItemList[i].type = "single"
        }
        this.setState({
            question: exerciseWithoutAnswerItemList
        })
        const userExamRes = await this.examService.getUserExam();
        if (userExamRes.isPass) {
            Toast.success("您已通过考试，不用重复参加");
            this.props.history.goBack();
        }
    }

    async selectOption(e) {
        // console.log(e.currentTarget)
        // 获取自定义属性
        // this.state.answer[this.state.index]=e.currentTarget.getAttribute('class')
        // console.log(e.currentTarget.setAttribute('class','am-button select am-button-active'))
        let list = this.state.answer;
        if (this.state.question[this.state.index].type === 'single') {
            // 获取类为select的元素
            var single = document.getElementsByClassName('select')
            // 将元素转化为数组
            let single = Array.from(single)
            // 单选时，先清空选中状态
            single.map((item) => {
                item.className = 'option'
            })
            e.currentTarget.className === 'select' ? e.currentTarget.className = 'option' : e.currentTarget.className = 'select'

            list[this.state.index] = e.currentTarget.getAttribute('data-index')
        } else if (this.state.question[this.state.index].type === 'multiple') {
            e.currentTarget.className === 'select' ?
                (
                    list[this.state.index] = list[this.state.index].replace(e.currentTarget.getAttribute('data-index').toString(), ''),
                        e.currentTarget.className = 'option'
                )
                : (
                    e.currentTarget.className = 'select',
                        list[this.state.index] += e.currentTarget.getAttribute('data-index')
                )
        }
        // 最后修改state的值
        await this.setState({
            answer: list
        })
        let index = this.state.answer[this.state.index];
        let answerStr = String.fromCharCode(65 + parseInt(index));
        const verificationExerciseRes = await this.examService.verificationExercise(this.state.question[this.state.index].id, answerStr);
        if (verificationExerciseRes.isCorrect) {
            let correctNum = this.state.correctNum + 1;
            this.setState({
                point: (correctNum / 12 * 100).toFixed(0),
                correctNum
            })
        }
        if (this.state.index === 11) {
            let userExercises = [];
            for (let i = 0; i < this.state.question.length; i++) {
                userExercises = userExercises.concat({
                    id: this.state.question[i].id,
                    question: this.state.question[i].question,
                    selections: this.state.question[i].selections,
                    userAnswer: String.fromCharCode(65 + parseInt(this.state.answer[i]))
                })
            }
            const examSubmitRes = await this.examService.submitUserExam({userExercises});
            if (examSubmitRes.score >= 60) {
                Toast.success("恭喜您通过考试，最后的得分为" + examSubmitRes.score);
            } else {
                Toast.fail("对不起，您未通过考试，最后的得分为" + examSubmitRes.score + "，请多多努力");
            }
            this.props.history.goBack();
        } else {
            this.setState({
                index: this.state.index + 1
            })
        }
    }

    onModalClose() {
        this.setState({
            isNotificationModalShow: false
        })
    }

    render() {
        return (
            <div className='page'>
                <Modal
                    visible={this.state.isNotificationModalShow}
                    className='ModalClass'
                    onClose={() => {
                        this.onModalClose();
                    }}
                    style={{width: 250, height: 238, textAlign: 'center'}}
                >
                    <div className='modalBg'
                         style={{textAlign: 'start', width: '100%', height: '100%', backgroundColor: '#C79F62'}}>
                        <div style={{height: 60, width: '100%'}}/>
                        <WingBlank size="lg">
                            <div style={{
                                color: 'black',
                                fontSize: 12,
                                fontWeight: 600
                            }}>欢迎参加跨次元平台会员问卷答题，只要你成为会员即可参与抽盒蛋、参与竞价，购买素材、积分购买、更改昵称、购买收藏上限、邀请注册、进行入驻、喜欢作品！
                            </div>
                            <div style={{color: 'white', fontSize: 12, fontWeight: 600}}>答题规则:</div>
                        </WingBlank>
                    </div>
                </Modal>
                {/* 页面头部 */}
                <Header title={'竞价'} theme={{bgColor: 'black', title: 'white', mode: 'dark'}}>
                    <img src={ask} style={{width: '20px', height: '20px'}} onClick={() => {
                        this.setState({
                            isNotificationModalShow: true
                        })
                    }}/>
                </Header>
                {/* 上下留白 */}
                {/* <WhiteSpace size='xl' /> */}
                {/* 图片部分 */}
                <div className='topBg'>
                    {/* <img src={image1} style={{width:'100%',height:'100%'}} /> */}
                    <div className='BgYz'>
                        <div>官方</div>
                    </div>
                    <div className='BgYh'/>
                    <div className='YhTitle'/>
                    <div className='BgPanel'>
                        <div style={{
                            fontSize: 15,
                            fontWeight: 600,
                            color: 'white',
                            letterSpacing: 2,
                            margin: '10px 10px',
                        }}>正式会员问题
                        </div>
                        <div style={{
                            fontSize: '12px',
                            color: '#DDDDDD',
                            fontWeight: 600,
                            letterSpacing: 2,
                            marginTop: 15,
                            marginLeft: 10
                        }}>该部分共12题
                        </div>
                    </div>
                </div>
                {/* 中间部分 */}
                <div style={{height: 330, width: '100%', position: 'relative'}}>
                    <div className='midBgBorder'>
                        <div className='midBg'>
                            <div style={{height: 60}}/>
                            {/* 左上角图标 */}
                            <WingBlank size="lg">
                                <div style={{}}>
                                    <div style={{textAlign: 'start'}}>
                                        <div style={{
                                            fontSize: 12,
                                            color: '#666666',
                                            fontWeight: 600,
                                        }}>第{this.state.index + 1}/12题
                                        </div>
                                        <div className='midDt'/>
                                    </div>
                                </div>
                            </WingBlank>
                            {/* 题目内容 */}
                            <WingBlank size="lg">
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: 12,
                                    textAlign: 'start',
                                    marginTop: 5
                                }}>{this.state.question[this.state.index].question}</div>
                            </WingBlank>
                            {/* 答题区域 */}
                            <WingBlank size="lg">
                                <div style={{
                                    fontWeight: 600,
                                    fontSize: 15,
                                    marginTop: 15,
                                    textAlign: 'center',
                                    overflow: 'scroll',
                                    height: 230
                                }}>
                                    {/* 这里条件打印出选项 */}
                                    {
                                        // <div className='option' onClick={(e)=>this.selectOption(e)} data-index={1}>指定</div>
                                        this.state.question[this.state.index].option.map((item, index) =>
                                            // <Button className={'option'} onClick={(e) => this.selectOption(e)} data-index={index}>{item}</Button>
                                            <div className='option' onClick={(e) => this.selectOption(e)}
                                                 data-index={index} key={index}>{item}</div>
                                        )
                                    }
                                </div>
                            </WingBlank>
                        </div>
                    </div>
                </div>
                {/* 底部 */}
                <div className='btBg'>
                    <div className='point'>
                        <div className='item'>当前得分:</div>
                        <div className='item' style={{color: '#FE2341'}}>{this.state.point + '分'}</div>
                    </div>
                    {/* <WhiteSpace size='md' /> */}
                    <div className="progress">
                        <Progress percent={this.state.point} position="normal" className='prog' style={{
                            width: '85%',
                            display: 'inline-block',
                            backgroundColor: '#F7A7A1',
                            color: '#FE2341',
                            position: 'relative'
                        }} barStyle={{border: '2px solid #FE2341'}}/>
                    </div>
                    <div style={{
                        fontSize: 10,
                        transform: 'scale(0.8)',
                        fontWeight: 600,
                        marginTop: 10
                    }}>{'成为会员即可参与抽盒蛋、参与竞价，购买素材、积分购买、更改昵称、购买收藏上限、邀请注册、进行入驻、喜欢作品'}</div>
                </div>
            </div>
        )
    }

}

export default Answer

