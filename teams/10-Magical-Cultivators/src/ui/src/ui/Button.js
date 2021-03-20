/* eslint-disable */
import React, { useState } from 'react'
import Icon from './Icon'
import { makeStyles } from '@material-ui/styles'
import { sleepSeconds } from '../utils/time.util'

const useStyles = makeStyles(theme => ({
  common: {
    ...theme.layout.row,
    height: '40px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    border: '1px solid rgba(137,142,255,1)',
    fontSize: '14px',
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
    lineHeight: '16px',
    textDecoration: 'none',
    cursor: 'pointer',
    // '&:link': {
    //   color: 'inherit',
    // },
    // '&:visited': {
    //   color: 'inherit',
    // },
    // '&:hover': {
    //   color: 'inherit',
    // },
    '&:focus': {
      outline: 'none',
    },
  },
  primary: {
    background: 'rgba(137,142,255,1)',
    color: 'rgba(255,255,255,1)',
    '&:active': {
      color: 'rgba(255,255,255,1)',
    },
  },
  secondary: {
    color: 'rgba(137,142,255,1)',
    '&:active': {
      color: 'rgba(137,142,255,1)',
    },
  },
  long: {
    width: '170px',
  },
  policy: {
    width: '493px',
  },
  icon: {
    marginRight: '8px',
  },
  disabled: {
    opacity: '0.5',
    cursor: 'default',
  },
}))

export default function CustomButton(props) {
  const classes = useStyles()
  const [active, setActive] = useState(false)
  let className = []
  className.push(classes.common)
  if (props.primary) {
    className.push(classes.primary)
  } else {
    className.push(classes.secondary)
  }
  if (props.long) {
    className.push(classes.long)
  }
  if (props.policy) {
    className.push(classes.policy)
  }
  if (props.disabled) {
    className.push(classes.disabled)
  }
  if (props.className) {
    className.push(props.className)
  }
  let onClick = null
  if (props.onClick) {
    onClick = props.onClick
  }
  // **********************************************************************
  // 设置禁止点击时间
  const onClickWithDisableState = async () => {
    if (props.disabled) return
    props.onClick()
    setActive(true)
    await sleepSeconds(props.inactiveTime)
    setActive(false)
  }
  if (props.inactiveTime) {
    return (
      <button
        disabled={active}
        className={className.join(' ')}
        style={props.height ? { height: props.height } : null}
        onClick={onClickWithDisableState}
      >
        {props.icon ? <Icon primary={props.primary} name={props.icon} className={classes.icon} /> : null}{props.children}
      </button>
    )
  }
  // **********************************************************************
  let style = {}
  if (props.style) style = {...style, ...props.style}
  if (props.height) style.height = props.height
  if (props.width) style.width = props.width

  if (props.disabled) {
    return (
      <a
        className={className.join(' ')}
        style={style}
      >
        {props.icon ? <Icon primary={props.primary} name={props.icon} className={classes.icon} /> : null}{props.children}
      </a>
    )
  } else {
    return (
      <a
        className={className.join(' ')}
        style={style}
        onClick={onClick}
      >
        {props.icon ? <Icon primary={props.primary} name={props.icon} className={classes.icon} /> : null}{props.children}
      </a>
    )
  }
}
