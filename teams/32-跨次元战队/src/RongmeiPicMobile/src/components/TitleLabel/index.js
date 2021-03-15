import React from 'react'

class TitleLabel extends React.Component{

    render(){
        return (
            <p style={{textAlign:'left',marginLeft:'15px',color:'#888'}}>{this.props.children}</p>
        )
    }
}
export default TitleLabel
