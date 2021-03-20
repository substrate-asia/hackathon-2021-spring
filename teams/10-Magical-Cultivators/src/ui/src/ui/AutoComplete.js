/* eslint-disable */
import React, { useState, useEffect } from 'react'
import TextField from './TextField'
import Icon from './Icon'
import { makeStyles } from '@material-ui/styles'

const useStyles = makeStyles(theme => ({
  root: {
    position: 'relative',
    paddingLeft: '-1px',
    marginBottom: '5px',
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    boxSizing: 'border-box',
    borderRadius: '4px',
    background: 'rgba(249,250,253,1)',
    width: '100%',
  },
  left: {
    display: 'flex',
    flexGrow: 1,
    minHeight: '40px',
  },
  right: {
    marginRight: '12px',
  },
  tagWrapper: {
    margin: '8px 4px 8px 16px',
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  select: {
    paddingBottom: '4px',
    display: 'flex',
    flexDirection: 'column',
    position: 'absolute',
    top: '-312px',
    width: '100%',
    height: '300px',
    background: 'rgba(255,255,255,1)',
    boxShadow: '0px 6px 10px 0px rgba(69,73,91,0.8)',
    borderRadius: '4px',
  },
  inputWrapper: {
    margin: '16px',
  },
  input: {
    display: 'flex'
  },
  listsWrapper: {
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
  },
  list: {
    display: 'flex',
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    height: '56px',
    background: 'rgba(255,255,255,1)',
    boxShadow: 'inset 0px -1px 0px 0px rgba(244,245,250,1)',
    '&:hover': {
      background: 'rgba(249,250,253,1)',
    },
  },
  listLeft: {
    display: 'flex',
    flexGrow: 1,
    margin: '20px 0 20px 16px',
    height: '16px',
    fontSize: '14px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    color: 'rgba(70,72,85,1)',
    lineHeight: '16px',
  },
  listRight: {
    margin: '16px',
  },
  tag: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '24px',
    background: 'rgba(93,189,234,0.15)',
    borderRadius: '4px',
    margin: '2px 4px',
  },
  tagItem: {
    padding: '6px 4px 6px 10px',
    height: '12px',
    fontSize: '12px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    color: 'rgba(70,72,85,1)',
    lineHeight: '12px',
  },
  tagIcon: {
    paddingRight: '4px',
  }
}))

export default function AutoComplete(props) {
  const classes = useStyles()
  const [showSelect, setShowSelect] = useState(false)
  const [searchContent, setSearchContent] = useState('')
  const [lists, setLists] = useState(props.rows)

  const handleClicOutSide = () => {
    setShowSelect(false)
  }

  useEffect(() => {
    // Bind the event listener
    window.addEventListener('click', handleClicOutSide)
    return () => {
      // Unbind the event listener on clean up
      window.removeEventListener('click', handleClicOutSide)
    }
  }, [])

  const handleShowSelect = e => {
    e.stopPropagation()
    setShowSelect(!showSelect)
    if (lists.length !== props.rows.length) setLists(props.rows)
    setSearchContent('')
  }

  const handleClickX = (e, item) => {
    e.stopPropagation()
    e.preventDefault();
    props.onRemoveTag(item)
  }

  const handleChange = content => {
    setSearchContent(content)
  }

  const handleClickSearch = e => {
    if (e) e.stopPropagation()
    let update = props.rows.filter(obj => {
      let name = obj.name.toLowerCase()
      let t = name.includes(searchContent.toLowerCase())
      return t
    })
    setLists(update)
  }

  const handleClickItem = (e, obj) => {
    e.stopPropagation()
    props.onClickAddTag(obj)
  }

  let className = []
  className.push(classes.common)
  if (props.className) {
    className.push(props.className)
  }
  let { rows, value } = props
  let selected = rows.filter(o => value && value.includes(o.key))

  return (
    <div className={classes.root} onClick={handleShowSelect} style={showSelect ? { border: '1px solid rgba(137,142,255,1)', boxShadow: '-1px 1px 8px 0px rgba(126,114,242,0.3)', background: 'rgba(255,255,255,1)', } : null}>
      {
        showSelect &&
        <div className={classes.select}>
          <div className={classes.inputWrapper} onClick={e => e.stopPropagation()}>
            <TextField
              className={classes.input}
              tailIcon='search'
              onClickTailIcon={handleClickSearch}
              onChange={e => handleChange(e.target.value)}
              onPressEnter={handleClickSearch}
            />
          </div>
          <div className={classes.listsWrapper}>
            {
              lists.map((obj, index) => {
                return (
                  <React.Fragment key={index}>
                    <div className={classes.list}>
                      <div className={classes.listLeft}>
                        {obj.name}
                      </div>
                      {value.includes(obj.key) ? null : <Icon className={classes.listRight} name="add" onClick={(e) => handleClickItem(e, obj)} />}
                    </div>
                  </React.Fragment>
                )
              })
            }
          </div>
        </div>
      }
      <div className={classes.left}>
        <div className={classes.tagWrapper}>
          {

            selected.map((o, index) => {
              return (
                <div key={index} className={classes.tag}>
                  <div className={classes.tagItem}>{o.name}</div>
                  <Icon disabled={props.disabled} className={classes.tagIcon} name='cancel' small onClick={e => handleClickX(e, o)} />
                </div>
              )
            })
          }
        </div>
      </div>
      <Icon disabled={props.disabled} className={classes.right} name={showSelect ? 'up_arrow' : 'down_arrow'} onClick={handleShowSelect} />
    </div>
  )
}
