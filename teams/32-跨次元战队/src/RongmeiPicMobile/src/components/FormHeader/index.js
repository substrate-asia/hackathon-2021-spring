import React from 'react'
import {Icon, NavBar} from "antd-mobile";
import {withRouter} from "react-router-dom";

@withRouter
class FormHeader extends React.Component {
    render() {
        return (
            <NavBar
                mode="light"
                icon={<Icon type="left"/>}
                onLeftClick={this.props.back}
                rightContent={[
                    <div style={{color: "#EC5753", fontSize: '18px'}} onClick={this.props.save}>保存</div>
                ]}
                style={{height:'60px'}}
            >{this.props.title}</NavBar>
        )
    }
}

export default FormHeader
