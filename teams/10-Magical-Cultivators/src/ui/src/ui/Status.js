import React from 'react'
import './Status.scss'
import { customCase } from '../utils/string.util'

export default function Status(props) {
  let wrapper = ['common-status']
  let style
  let { type } = props
  if (type) type = type.toLowerCase()
  switch (type) {
    case 'pass':
      style = 'primary'
      break
    case 'pending':
      style = 'warn'
      break
    case 'apply':
      style = 'warn'
      break
    case 'failed':
      style = 'error'
      break
    case 'abnormal':
      style = 'error'
      break
    case 'abnormal_aml':
      style = 'error'
      break
    case 'error':
      style = 'error'
      break
    case 'rejected':
      style = 'error'
      break
    default:
      style = 'primary'
      break
  }
  wrapper.push(`${style}-bg`)

  return (
    <div className={wrapper.join(' ')} style={props.style}>
      <div className={style}>
        {props.label && props.label}&nbsp;
        {customCase(type)}
      </div>
    </div>
  )
}
