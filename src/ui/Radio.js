/* eslint-disable react/prop-types */
import React from 'react'
import { makeStyles } from '@material-ui/core/styles'
import './Radio.scss'

const useStyles = makeStyles(theme => ({
  text: {
    display: 'flex',
    paddingLeft: '40px',
    width: '52px',
    height: '40px',
    fontSize: '14px',
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
    color: 'rgba(70,72,85,1)',
    lineHeight: '40px',
  },
}))

export default function Radio(props) {
  const classes = useStyles()
  let container = ['radio-container']
  if (props.className) container.push(props.className)

  const handleChange = e => {
    if (props.disabled) return
    else props.changed(e)
  }

  return (
    <label className={container.join(' ')} style={props.disabled ? { cursor: 'default', opacity: 0.5, ...props.style } : props.style}>
      <input
        id={props.id}
        type="radio"
        name="radio"
        onChange={handleChange}
        value={props.value}
        checked={props.isSelected}
      />
      <span className="radio-checkmark" />
      <div className={classes.text}>{props.text}</div>
    </label>
  )
}
