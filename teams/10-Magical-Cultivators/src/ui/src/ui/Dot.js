import React from 'react'
import './Dot.scss'

export default function Dot(props) {
  let style = {}
  if (props.style) style = { ...style, ...props.style }
  if (props.color) style = { ...style, background: props.color }
  return (
    <div className='dot-icon' style={style}></div>
  )
}
