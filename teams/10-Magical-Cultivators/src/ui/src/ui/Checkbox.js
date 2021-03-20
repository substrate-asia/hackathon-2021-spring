/* eslint-disable react/prop-types */
import React from 'react'
import Checkbox from '@material-ui/core/Checkbox'
import Icon from './Icon'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import { makeStyles } from '@material-ui/core/styles'

const useStyles = makeStyles(theme => ({
  common: {

  },
}))


export default function Radio(props) {
  const classes = useStyles()
  let container = []
  container.push(classes.common)
  if (props.className) container.push(props.className)

  return (
    <div className={container.join(' ')}>
      <FormControlLabel
        control={
          <Checkbox
            checkedIcon={<Icon name="checkbox_checked" />}
            icon={<Icon name="checkbox" />}
            disabled={props.disabled}
            checked={props.checked}
            onChange={props.onChange} />
        }
        label={props.label}
      />
    </div>
  )
}
