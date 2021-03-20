/* eslint-disable */
import React, { Component } from 'react'
import { withStyles } from '@material-ui/core/styles'
import { customSubstr } from '../utils/string.util'
import PropTypes from 'prop-types'
import Icon from './Icon'
import Flex from './Flex'
import Status from './Status'
import Button from './Button'
import { dateFmt } from '../utils/time.util'
import './Table.scss'

const styles = theme => ({
  root: {
    // tableLayout: 'fixed',
    padding: 0,
    margin: 0,
    width: '100% !important',
  },
  header: {
    fontSize: '14px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    color: '#B0B0B0',
    lineHeight: '16px',
    borderBottom: '10px solid red',
  },
  headerRow: {
    boxShadow: '0px 3px 4px 0px rgba(235,236,242,1)',
  },
  headerElement: {
    height: '40px',
    textAlign: 'left',
    fontWeight: '400',
  },
  tableBody: {
    fontSize: '14px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    color: 'rgba(70,72,85,1)',
    lineHeight: '16px',
  },
  tableBodyRow: {
    '&:hover td': {
      background: '#F9FAFD',
    },
  },
  tableElement: {
    cursor: 'pointer',
    height: '56px',
    boxShadow: '0px -1px 0px 0px rgba(244,245,250,1)',
    background: 'rgba(255,255,255,1)',
    textAlign: 'left',
  },
})

const checkAlign = (name, index, arrLength) => {
  // 最右侧栏无脑居右
  if (index === arrLength - 1) return true
  name = name.toLowerCase()
  let arr = ['decimal', 'fee', 'switch', 'addresswithmemo', 'confirmation', 'jporderid', 'openbydefault']
  for (let i = 0; i < arr.length; i++) {
    if (name.includes(arr[i])) return true
  }
  return false
}

const getTableStyle = (column, index, arrLength, pointer = false) => {
  let { name = '', col } = column
  let flag = checkAlign(name, index, arrLength)
  let obj = {}
  if (flag) {
    obj.textAlign = 'right'
  } else {
    obj.textAlign = 'left'
  }
  if (column.align) obj.textAlign = column.align
  if (index === 0) obj.paddingLeft = '24px'
  if (index === arrLength - 1) obj.paddingRight = '24px'
  if (col) obj.width = col
  if (pointer) obj.cursor = 'default'
  return obj
}

class Table extends Component {
  state = {
    items: [],
    showMsg: false,
    title: '',
    date: '',
    body: '',
  }

  componentDidMount() {
    let { items } = this.props
    this.setState({
      items,
    })
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.items !== this.state.items) {
      this.setState({
        items: nextProps.items,
      });
    }
  }

  handleClickMsg = row => {
    let { content, updatedAt } = row
    let { title, body } = content
    this.setState({
      showMsg: true,
      title,
      date: dateFmt(updatedAt),
      body
    })
  }

  handleClickCancel = () => {
    this.setState({
      showMsg: false,
      title: '',
      date: '',
      body: '',
    })
  }

  render() {
    let { classes, columns } = this.props
    let { items, showMsg, title, date, body } = this.state

    return (
      <table cellPadding='0' cellSpacing='0' border='0' className={classes.root} style={this.props.style}>
        {
          showMsg &&
          <Flex className='custom-table-message-panel'>
            <Flex style={{ flexDirection: 'row', alignItems: 'center' }} className='custom-table-message-panel-title'>
              <div style={{ display: 'flex', flexGrow: 1, marginLeft: '24px' }} className='custom-table-message-panel-general-title'>MESSAGE DETAIL</div>
              <Icon name='cancel' style={{ marginRight: '16px' }} onClick={this.handleClickCancel} />
            </Flex>
            <Flex className='custom-table-message-panel-body'>
              {title ? <div style={{ margin: '16px 16px 0 24px' }} className='custom-table-message-panel-body-title'>{title}</div> : null}
              <div style={title ? { margin: '8px 16px 0 24px' } : { margin: '16px 16px 0 24px' }} className='custom-table-message-panel-body-sub-title'>{date}</div>
              <Flex style={{ margin: '16px 16px 0 24px' }}>
                {body}
              </Flex>
            </Flex>
            <Flex className='custom-table-message-panel-footer'>
              <div style={{ display: 'flex', flexDirection: 'row-reverse', marginRight: '16px' }}>
                <Button primary onClick={this.handleClickCancel} width='156px'>CLOSE</Button>
              </div>
            </Flex>
          </Flex>
        }
        <thead className={classes.header}>
          {
            columns
            &&
            <tr className={classes.headerRow}>
              {
                columns.map((column, index) => {
                  return (
                    <th
                      key={index}
                      className={classes.headerElement}
                      style={getTableStyle(column, index, columns.length)}
                    >
                      {column.name}
                    </th>
                  )
                })
              }
            </tr>
          }
        </thead>
        <tbody className={classes.tableBody} style={{ paddingTop: '2px' }}>
          {
            items
            &&
            items.map((item, index1) => {
              return (
                <tr
                  key={index1}
                  className={classes.tableBodyRow}
                >
                  {
                    columns
                    &&
                    columns.map((column, index2) => {
                      // 显示audit页最后一列icon operation
                      if (column.icon) {
                        return (
                          <td
                            key={index2}
                            className={classes.tableElement}
                            style={{ display: 'flex', alignItems: 'center', flexDirection: 'row-reverse', paddingRight: '24px' }}
                            onClick={e => this.props.onClickRow(e, item)}
                          >
                            <Icon name={column.icon} />
                          </td>
                        )
                      } else if (column.key === 'status' || column.key === 'result' || column.name.toLowerCase() === 'result') {
                        return (
                          <td className={classes.tableElement} style={{ cursor: 'default' }} onClick={e => this.props.onClickRow(item)}>
                            <div style={{ display: 'flex' }}>
                              {
                                column.key.map((element, elementIndex) => {
                                  return (
                                    <div key={elementIndex} style={{ marginRight: '4px' }}>
                                      <Status label={`${customSubstr(element, item)}`} type={element.split('.')[1]} />
                                    </div>
                                  )
                                })
                              }
                            </div>
                          </td>
                        )
                      } else if (column.name.toLowerCase() === 'message') {
                        return (
                          <td className={classes.tableElement} onClick={() => this.handleClickMsg(item)}>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                              {
                                item.content.title.substring(0, 20) || item.content.body.substring(0, 20)
                              }
                              &nbsp;
                              <Icon name='preview' medium />
                            </div>
                          </td>
                        )
                      } else {
                        return (
                          <td
                            key={index2}
                            className={classes.tableElement}
                            style={getTableStyle(column, index2, columns.length, true)}
                          >
                            {`${customSubstr(column.key, item)}`}
                          </td>
                        )
                      }
                    })
                  }
                </tr>
              );
            })
          }
        </tbody>
      </table >
    )
  }
}

export default withStyles(styles)(Table)

Table.propTypes = {
  columns: PropTypes.array.isRequired,
  items: PropTypes.array,
  onClickRow: PropTypes.func.isRequired,
}
