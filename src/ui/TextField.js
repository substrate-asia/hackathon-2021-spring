/* eslint-disable */
import React, { useState } from 'react'
import Icon from './Icon'
import Flex from './Flex'
import { makeStyles } from '@material-ui/styles'
import './TextField.scss'

const useStyles = makeStyles(theme => ({
  common: {
    ...theme.layout.row,
    height: '40px',
    boxSizing: 'border-box',
    borderRadius: '4px',
    background: 'rgba(249,250,253,1)',
    width: '100%',
    fontSize: '14px',
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
    color: 'rgba(70,72,85,1)',
    lineHeight: '16px',
    border: 'none',
    '&:focus': {
      outline: 'none',
      background: 'rgba(255,255,255,1)',
      boxShadow: '-1px 1px 8px 0px rgba(126,114,242,0.3)',
      border: '1px solid rgba(137,142,255,1)',
    },
    '&::placeholder': {
      height: '16px',
      fontSize: '14px',
      fontFamily: 'Roboto-Medium',
      fontWeight: '500',
      color: 'rgba(192,196,210,1)',
      lineHeight: '16px',
    },
  },
  main: {
    marginBottom: '32px',
  },
  key: {
    ...theme.form.key,
  },
  indentIcon: {
    position: 'absolute',
    padding: '8px 12px',
    cursor: 'default !important',
  },
  secondaryTailIcon: {
    right: 28,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    margin: '8px 12px',
  },
  tailIcon: {
    right: 0,
    top: 0,
    display: 'flex',
    alignItems: 'center',
    position: 'absolute',
    margin: '8px 12px',
  },
  errMsg: {
    color: theme.color.error,
    position: 'absolute',
    marginTop: '4px',
    marginLeft: '16px',
    fontSize: '14px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    lineHeight: '16px',
    maxWidth: '100%',
    display: 'flex',
    flexWrap: 'wrap',
  },
}))

export default function CustomInput(props) {
  const [showErr, setShowErr] = useState(false)
  const [errMsg, setErrMsg] = useState(' ')

  function validateInput(value) {
    let ret = true
    let { type, required } = props
    // 1. 检测是否required
    if (required && !value) {
      setShowErr(true)
      setErrMsg('field is required')
      return
    } else {
      setShowErr(false)
      setErrMsg('')
    }

    // 2. 检查type
    switch (type) {
      case 'email':
        let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
        if (!re.test(value)) {
          ret = false
          setErrMsg('field is not a valid email')
        }
        break
      case 'password':
        if (value.length < 8) {
          ret = false
          setErrMsg('password length must over than 8')
          break
        }
        if (value.toUpperCase() === value || value.toLowerCase() === value || !/\d/.test(value)) {
          ret = false
          setErrMsg('password must contain uppercase and lowercase letters and numbers')
        }
        break
      default:
        ret = true
        setShowErr(false)
        setErrMsg('')
    }

    if (!ret) {
      setShowErr(true)
    } else {
      setShowErr(false)
    }
  }

  function handleChange(e) {
    // 检查type
    validateInput(e.target.value)

    if (props.onChange) {
      props.onChange(e)
    }
  }
  //onBlur后检查输入
  function handleBlur(e) {
    validateInput(e.target.value)
    if (props.onBlur) {
      props.onBlur(e)
    }
  }

  function handleFocus(e) {
    if (props.onFocus) {
      props.onFocus(e)
    }
  }

  function handleKeyDown(e) {
    // 仅检测按下Enter键
    if (e.key === 'Enter' && props.onPressEnter) {
      props.onPressEnter()
    }
  }

  const classes = useStyles()
  let className = []
  className.push(classes.common)
  let { className: propsClassName, type, placeholder, value, label, indentIcon, tailIcon } = props
  if (propsClassName) {
    className.push(propsClassName)
  }

  let realStyle = { textIndent: '16px' }
  if (indentIcon) {
    realStyle = { ...realStyle, textIndent: '46px' }
  }
  // props.unShowError: 显示错误总开关, props级别
  // showError 当前组件显示错误开关, state级别
  if (!props.unShowError && showErr) {
    realStyle = { ...realStyle, border: '1px solid rgba(236,69,98,1)', boxShadow: '-1px 1px 8px 0px rgba(236,69,98,0.3)', }
  }

  let customInput = (
    <div style={{ position: 'relative' }}>
      {indentIcon ?
        <Icon
          name={indentIcon}
          className={classes.indentIcon}
          error={props.unShowError ? false : showErr}
        /> : null}
      <input
        disabled={props.disabled}
        type={type || 'text'}
        style={realStyle}
        className={className.join(' ')}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        value={value}
        placeholder={placeholder}
        ref={props.inputRef}
      />
      {
        props.onClickX && value &&
        <Icon
          disabled={props.tailIconDisabled}
          name='cancel'
          color='rgba(70, 72, 85, 0.9)'
          className={classes.secondaryTailIcon}
          onClick={() => props.onClickX()}
        />
      }
      {tailIcon ?
        <Icon
          disabled={props.tailIconDisabled}
          name={tailIcon}
          className={classes.tailIcon}
          onClick={props.onClickTailIcon}
        />
        : null}
      {
        props.unShowError ?
          null
          :
          <div className={classes.errMsg}>{errMsg}</div>
      }
    </div>
  )

  if (props.label) {
    return (
      <div className={classes.main} style={props.style}>
        <Flex row className={classes.key}>
          <div style={{ display: 'flex', flexGrow: 1 }}>{label}</div>
          {props.tailLable && <div>Available: {props.tailLable}</div>}
        </Flex>
        {customInput}
      </div>
    )
  } else {
    return customInput
  }
}
