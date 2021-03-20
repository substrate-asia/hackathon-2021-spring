/* eslint-disable */
import React from 'react'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  common: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'default !important',
    margin: '0',
    paddingLeft: '6px',
    paddingRight: '6px',
    height: '24px',
    borderRadius: '4px',
    border: '1px solid #C8D3F7',
    fontSize: '12px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    color: 'rgba(70,72,85,1)',
    lineHeight: '22px',
  },
  light: {
    border: '1px solid #C8D3F7',
  },
  long: {
    width: '54px',
  },
}))

export default function Tag(props) {
  const classes = useStyles()
  let className = []
  className.push(classes.common)
  if (props.light) {
    className.push(classes.light)
  }
  if (props.long) {
    className.push(classes.long)
  }
  if (props.className) {
    className.push(props.className)
  }

  return (
    <p className={className.join(' ')}>{props.name}</p>
  )
}
