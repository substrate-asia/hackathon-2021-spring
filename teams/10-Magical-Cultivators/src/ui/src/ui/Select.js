/* eslint-disable react/prop-types */
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  container: {
    minWidth: '64px',
    minHeight: '28px',
    background: 'rgba(255,255,255,0.8)',
    borderRadius: '4px',
    border: 'none',
    fontSize: '14px',
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
    color: 'rgba(137,142,255,1)',
    textAlignLast: 'center',
    textAlign: 'center',
    lineHeight: '14px',
    '&:focus': {
      outline: 'none',
      background: 'rgba(255,255,255,1)',
      boxShadow: '-1px 1px 8px 0px rgba(126,114,242,0.3)',
      border: '1px solid rgba(137,142,255,1)',
    },
  },
})

class Select extends Component {
  constructor(props) {
    super(props)
    this.state = {
      value: props.value,
      options: this.handleOptions(props.options)
    }
    this.onChange = this.onChange.bind(this)
  }
  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value, options: this.handleOptions(nextProps.options) })
  }
  handleOptions(options) {
    let arr = []
    options.forEach(function (option) {
      const type = typeof option
      if (type === 'number' || type === 'string') {
        arr.push({ value: option, text: option })
      } else {
        arr.push(option)
      }
    })
    return arr
  }
  onChange(e) {
    const { onChange } = this.props
    const target = e.target
    onChange && onChange(target.value, target.selectedIndex)
  }
  render() {
    const { value, options } = this.state
    const { classes, className } = this.props
    let realStyle = []
    realStyle.push(classes.container)
    if (className) {
      realStyle.push(className)
    }
    return (
      <select className={realStyle.join(' ')} value={value} onChange={this.onChange} style={this.props.style}>
        {
          options.map(function (option, index) {
            return <option key={index} value={option.value}>{option.text}</option>
          })
        }
      </select>
    )
  }
}

export default withStyles(styles)(Select)
