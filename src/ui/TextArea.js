import React from 'react';
import './TextArea.scss';

export default function TextArea(props) {
  const { value } = props

  function onChange(e) {
    props.onChange(e)
  }

  return (
    <textarea key={1} className='custom-textarea' style={props.style} onChange={onChange} value={value} placeholder={props.placeholder} />
  )
}
