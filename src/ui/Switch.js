/* eslint-disable */
import React from 'react'
import './Switch.scss'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    color: theme.color.lightBlue,
    cursor: 'pointer',
    width: '24px',
    height: '24px',
    fontSize: '24px',
    ...theme.layout.row,
  },
}))

export default function Switch(props) {
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

  const handleChange = e => {
    if (props.disabled) return
    else props.onChange(e)
  }

  return (
    <label className="switch-small">
      <input
        type="checkbox"
        checked={props.checked}
        onChange={handleChange}
      />
      <span className="slider-small round-small" style={props.disabled ? {cursor: 'default', opacity: 0.5} : null}></span>
    </label>
  )
}
