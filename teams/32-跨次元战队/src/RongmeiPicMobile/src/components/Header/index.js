import React from 'react'
import {Icon, NavBar} from "antd-mobile";
import {withRouter} from "react-router-dom";
import './style.css'

@withRouter
class Header extends React.Component {
    render() {
        return (
            <NavBar
                mode={this.props.theme.mode||'dark'}
                icon={<Icon type="left"/>}
                // className='am-navbar1'
                onLeftClick={() => this.props.history.goBack()}
                style={{height:'60px'}}
                rightContent={this.props.children}
            >{this.props.title}</NavBar>
        )
    }
}

export default Header
