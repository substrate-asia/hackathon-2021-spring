import React from 'react'
import {withRouter, Switch, Redirect, Route} from 'react-router-dom'
import LoadableComponent from '../../utils/LoadableComponent'

const Playground = LoadableComponent(() => import('../../routes/Playground/index'))  //参数一定要是函数，否则不会懒加载，只会代码拆分
const Friend = LoadableComponent(() => import('../../routes/Friend/index'))
const Message = LoadableComponent(() => import('../../routes/Message/index'))
const Me = LoadableComponent(() => import('../../routes/Me/index'))
const MinePortal = LoadableComponent(() => import('../../routes/MinePortal/index'))
const MineInfo = LoadableComponent(() => import('../../routes/MineInfo/index'))
const MineOrder = LoadableComponent(() => import('../../routes/MineOrder/index'))
const MineCoin = LoadableComponent(() => import('../../routes/MineCoin/index'))
const Answer = LoadableComponent(() => import('../../routes/Answer/index'))

@withRouter
class ContentMain extends React.Component {
  render() {
    return (
      <div style={{background: '#000'}}>
        <Switch>
          <Route exact path='/home' component={Playground}/>
          <Route exact path='/friend' component={Friend}/>
          <Route exact path='/message' component={Message}/>
          <Route exact path='/me' component={Me}/>
          <Route exact path='/me/info' component={MineInfo}/>
          <Route exact path='/me/coin' component={MineCoin}/>
          <Route exact path='/me/order' component={MineOrder}/>
          <Route exact path='/me/portal' component={MinePortal}/>
          <Route exact path='/answer' component={Answer}/>
          <Redirect exact from='/' to='/home'/>
        </Switch>
      </div>
    )
  }
}

export default ContentMain
