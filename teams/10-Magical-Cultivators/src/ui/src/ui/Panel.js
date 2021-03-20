/* eslint-disable */
import React from 'react'
import Icon from './Icon'
import './Panel.scss'

export default function Panel(props) {
  return (
    <div className='panel-root' style={props.style}>
      <div style={{ margin: '24px 20px 24px 24px' }}>
        <div className='panel-top'>
          <div className='panel-icon' style={{ background: props.icon_backgroud }}>
            <Icon name={props.icon_name} large color='white' />
          </div>
          <div className='panel-title-root' style={{ marginLeft: '22px' }}>
            <div className='panel-title'>{props.title}</div>
            <div className='panel-title-value' style={{ color: props.icon_backgroud, marginTop: '10px' }}>{props.value}</div>
          </div>
        </div>
        <div style={{ marginTop: '22px' }}>
          {props.children}
        </div>
      </div>
    </div>
  )
}
