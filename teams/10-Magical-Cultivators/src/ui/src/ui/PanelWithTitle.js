/* eslint-disable */
import React from 'react'
import Flex from './Flex'
import Icon from './Icon'
import { useHistory } from 'react-router-dom'
import './PanelWithTitle.scss'

export default function Panel(props) {
  let history = useHistory()

  const handleClickIcon = e => {
    e.stopPropagation()
    if (props.link) history.push(props.link)
  }

  const handleClickDiv = () => {
    if (props.divLink) history.push(props.divLink)
  }

  const getTitleLink = () => {
    if (!props.link) return
    if (props.gas) {
      return (
        <div className='panel-title-right' onClick={e => handleClickIcon(e)}>
          Gas
        </div>
      )
    } else {
      return <Icon name='view' style={{ marginRight: '12px', color: '#c0c4d3' }} onClick={e => handleClickIcon(e)} />
    }
  }

  return (
    <div className='panel-with-title-root' style={props.style} onClick={handleClickDiv}>
      <Flex row style={{ borderBottom: '1px solid rgba(244, 245, 250, 1)', height: props.subTitle ? '63px' : '51px', alignItems: 'center' }}>
        <div className="panel-title-left">
          {props.title}
          {props.subTitle && <div className='panel-title-left-subtitle' style={{ paddingTop: '8px' }}>{props.subTitle}</div>}
        </div>
        {
          getTitleLink()
        }
      </Flex>

      <Flex style={{ margin: '11px 24px 24px 24px' }}>
        {props.children}
      </Flex>
    </div>
  )
}
