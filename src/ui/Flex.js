import React from 'react'
import './Flex.scss'

export default function Flex(props) {
  let className = []
  if (props.className) className.push(props.className)
  if (props.row) {
    className.push('flex-row')
  } else {
    className.push('flex-column')
  }

  return (
    <div className={className.join(' ')} style={props.style}>{props.children}</div>
  )
}
