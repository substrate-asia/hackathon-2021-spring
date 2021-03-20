import React, { useState, useEffect } from 'react'
import TextField from './TextField'
import Icon from './Icon'
import './Search.scss'
import { useHistory } from 'react-router-dom'
import { PREFIX } from '../config'
import { connect } from 'react-redux'
import { showGlobalSearch, unShowGlobalSearch, toggleGlobalSearch, unShowSideDrawer } from '../reducers/global.reducer'

function Search(props) {
  let container = ['radio-container']
  let history = useHistory()
  const options = props.options
  if (props.className) container.push(props.className)
  // const [showSearch, setShowSearch] = useState(false)
  const [searchStr, setSearchStr] = useState('')

  const handleOutSideClick = () => {
    setSearchStr('')
    // setShowSearch(false)
    props.unShowGlobalSearchBox()
    // props.unShowRightSideDrawer()
  }

  useEffect(() => {
    // Bind the event listener
    window.addEventListener('click', handleOutSideClick)
    return () => {
      // Unbind the event listener on clean up
      window.removeEventListener('click', handleOutSideClick)
    }
  }, [])

  const handleChange = e => {
    setSearchStr(e)
  }

  const handleClick = e => {
    e.stopPropagation();
    e.preventDefault();
    let { globalObj } = props
    if (globalObj.showSideDrawer) {
      props.unShowRightSideDrawer()
    }
    if (!globalObj.showGlobalSearch) {
      props.showGlobalSearchBox()
    }
    // if (!showSearch) setShowSearch(true)
  }

  const handleClickLink = obj => {
    setSearchStr('')
    // setShowSearch(false)
    props.unShowGlobalSearchBox()
    let to = getQueryUrl(obj)
    history.push(to)
  }

  const getQueryUrl = obj => {
    if (searchStr.trim()) return `${PREFIX}${obj.link}?query=${searchStr}`
    else return `${PREFIX}${obj.link}`
  }

  return (
    <div className="global-search">
      <div style={{ width: '335px' }} onClick={handleClick}>
        <TextField
          value={searchStr}
          tailIconDisabled
          tailIcon='search'
          onChange={e => handleChange(e.target.value)}
        />
      </div>

      {
        // showSearch &&
        props.globalObj.showGlobalSearch &&
        <div className="search-dropdown">
          {
            options.map(obj => {
              return (
                <div className="search-list" key={obj.id} onClick={() => handleClickLink(obj)}>
                  <div className="search-list-left">
                    <Icon name={obj.icon} />
                    <div style={{ marginLeft: '8px' }} className="search-title">{obj.name}</div>
                    <div className="search-explain">(By {obj.explain})</div>
                  </div>
                  <div style={{ marginRight: '8px' }}>
                    <Icon name="right_arrow" color='rgba(0, 0, 0, 0.16)' />
                  </div>
                </div>
              )
            })
          }
        </div>
      }
    </div>
  )
}

const mapStateToProps = (state) => {
  const { globalObj } = state
  return {
    globalObj,
  }
}

const mapDispatchToProps = dispatch => {
  return {
    showGlobalSearchBox: () => dispatch(showGlobalSearch()),
    unShowGlobalSearchBox: () => dispatch(unShowGlobalSearch()),
    toggleGlobalSearchBox: () => dispatch(toggleGlobalSearch()),
    unShowRightSideDrawer: () => dispatch(unShowSideDrawer()),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Search)
