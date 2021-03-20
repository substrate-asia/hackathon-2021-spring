/* eslint-disable */
import React from 'react'
import './SwitchWithContent.scss'

export default function Switch(props) {
  const handleChange = e => {
    if (!props.disabled && props.onChange) {
      props.onChange(e)
    }
  }

  return (
    <div className="onoffswitch" >
      {/* adding extra input -> dirty workaround for css and onChange event */}
      <input
        id={props.id}
        className="onoffswitch-checkbox"
        type="checkbox"
        checked={props.checked}
        onChange={e => handleChange(e)}
      />
      <label className="onoffswitch-label" style={props.disabled ? { cursor: 'default', opacity: '0.5' } : { cursor: 'pointer', opacity: '1' }}>
        <input
          id={props.id}
          className="onoffswitch-checkbox"
          type="checkbox"
          checked={props.checked}
          onChange={e => handleChange(e)}
        />
        <span className="onoffswitch-inner"></span>
        <span className="onoffswitch-switch"></span>
      </label>
    </div>
  )
}
