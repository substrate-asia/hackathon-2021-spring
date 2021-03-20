/* eslint-disable */
import React from 'react'
import Icon from './Icon'
import Flex from './Flex'
import './TagWithX.scss'

export default function TagWithX(props) {
  const handleClick = () => {
    if (props.onClick) {
      props.onClick()
    }
  }

  return (
    <Flex row className='tag-with-x' style={props.style}>
      {props.name}
      <Icon name='cancel' color='white' small style={{ marginLeft: '4px' }} onClick={handleClick} />
    </Flex>
  )
}
