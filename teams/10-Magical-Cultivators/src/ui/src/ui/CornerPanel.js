/* eslint-disable */
import React from 'react'
import './CornerPanel.scss';

export default function CornerPanel(props) {

  return (
    <div className='common'>
      <div className='item'>
        {props.children}
      </div>
    </div>
  )
}
