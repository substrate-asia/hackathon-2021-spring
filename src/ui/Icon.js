import React from 'react'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    color: theme.color.lightBlue,
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    fontSize: '24px',
    ...theme.layout.row,
    // '&:hover': {
    //   background: '#F9FAFD',
    //   borderRadius: '12px',
    // },
  },
}))

export default function Icon(props) {
  const classes = useStyles()
  let className = []
  className.push(classes.root)
  className.push(`ic-${props.name}`)
  if (props.className) {
    className.push(props.className)
  }
  let onClick = null
  if (props.onClick) {
    onClick = props.onClick
  }
  let realStyle = null
  if (props.primary) {
    realStyle = { color: 'white' }
  }
  if (props.error) {
    realStyle = { color: '#EC4562' }
  }
  if (props.large) {
    realStyle = {
      width: '32px',
      height: '32px',
      fontSize: '32px',
    }
  }
  if (props.disabled) {
    realStyle = { ...realStyle, opacity: '0.5', cursor: 'default' }
  }
  if (props.small) {
    realStyle = { ...realStyle, width: '16px', height: '16px', fontSize: '16px' }
  }
  if (props.medium) {
    realStyle = { ...realStyle, width: '20px', height: '20px', fontSize: '20px' }
  }
  if (props.name === 'visibility_off' || props.name === 'visibility' || props.name === 'info' || props.name === 'question') {
    realStyle = { color: '#c0c4d3' }
  }
  if (props.color) {
    realStyle = { ...realStyle, color: props.color }
  }
  if (props.style) {
    realStyle = {...realStyle, ...props.style}
  }
  if (props.disabled) {
    return <span className={className.join(' ')} style={realStyle} />
  } else {
    return <span className={className.join(' ')} style={realStyle} onClick={onClick} />
  }
}
