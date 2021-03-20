/* eslint-disable */
import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import TextField from './TextField'
import Select from '../ui/Select'

const pageHeight = '28px'
const styles = theme => ({
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    height: pageHeight,
    borderRadius: '4px',
  },
  pageLeft: {
    display: 'flex',
    flexGrow: 1,
  },
  pageRight: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pagination: {
    background: 'rgba(255,255,255,0.8)',
    lineHeight: '14px',
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  pageLink: {
    cursor: 'pointer',
    display: 'inline-block',
    width: '24px',
    height: '14px',
    textAlign: 'center',
    padding: '4px 0px',
    textDecoration: 'none',
    fontSize: '12px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    color: 'rgba(192,196,210,1)',
    lineHeight: '14px',
  },
  customTextField: {
    height: pageHeight,
    width: '43px',
    marginLeft: '12px',
    background: 'rgba(255,255,255,0.79)',
    fontSize: '12px',
    fontFamily: 'Roboto-Medium',
    fontWeight: '500',
    color: 'rgba(137,142,255,1)',
    lineHeight: '14px',
  },
  resultPerPage: {
    height: '14px',
    fontSize: '12px',
    fontFamily: 'Roboto-Regular',
    fontWeight: '400',
    color: 'rgba(167,171,190,1)',
    lineHeight: '14px',
    marginRight: '12px',
  },
})

const LEFT_PAGE = 'LEFT'
const RIGHT_PAGE = 'RIGHT'
// help document and source code
// https://scotch.io/tutorials/build-custom-pagination-with-react
// https://github.com/gladchinda/build-react-pagination-demo

/**
 * Helper method for creating a range of numbers
 * range(1, 5) => [1, 2, 3, 4, 5]
 */
const range = (from, to, step = 1) => {
  let i = from
  const range = []

  while (i <= to) {
    range.push(i)
    i += step
  }

  return range
}


class Pagination extends Component {

  constructor(props) {
    super(props)
    this.state = {
      totalRecords: 0,
      pageLimit: 10,
      pageNeighbours: 0,
      currentPage: 1,
      totalPages: 1,
      tempPage: 1,       // 用户在输入框里输入的页码
    }
  }

  calculateTotalPages() {
    let { totalRecords, pageLimit } = this.state
    let totalPages = Math.ceil(totalRecords / pageLimit)
    this.setState({
      totalPages
    })
  }

  componentDidMount() {
    // this.gotoPage(1)
    let { totalRecords, pageLimit, pageNeighbours, currentPage = 1 } = this.props
    this.setState({
      totalRecords, pageLimit, pageNeighbours, currentPage, tempPage: currentPage
    }, () => this.calculateTotalPages())
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.totalRecords !== this.state.totalRecords) {
      this.setState({
        totalRecords: nextProps.totalRecords,
        currentPage: 1,
        tempPage: 1,
      }, () => this.calculateTotalPages())
    }
    if (nextProps.pageLimit !== this.state.pageLimit) {
      this.setState({
        pageLimit: nextProps.pageLimit,
        currentPage: 1,
        tempPage: 1,
      }, () => this.calculateTotalPages())
    }
    if (nextProps.currentPage !== this.state.tempPage) {
      this.setState({
        tempPage: nextProps.currentPage,
      })
    }
  }

  gotoPage = page => {
    let { onPageChanged = f => f } = this.props
    let { totalPages, pageLimit, totalRecords } = this.state
    let currentPage = Math.max(1, Math.min(page, this.state.totalPages))

    let paginationData = {
      currentPage,
      totalPages,
      pageLimit,
      totalRecords
    }

    this.setState({ currentPage }, () => onPageChanged(paginationData))
  }

  handleClick = page => evt => {
    evt.preventDefault()
    this.gotoPage(page)
    this.setState({ tempPage: page })
  }

  handleMoveLeft = evt => {
    evt.preventDefault()
    let page = this.state.currentPage - (this.state.pageNeighbours * 2) - 1
    this.gotoPage(page)
    this.setState({ tempPage: page })
  }

  handleMoveRight = evt => {
    evt.preventDefault()
    let page = this.state.currentPage + (this.state.pageNeighbours * 2) + 1
    this.gotoPage(page)
    this.setState({ tempPage: page })
  }

  /**
   * Let's say we have 10 pages and we set pageNeighbours to 2
   * Given that the current page is 6
   * The pagination control will look like the following:
   *
   * (1) < {4 5} [6] {7 8} > (10)
   *
   * (x) => terminal pages: first and last page(always visible)
   * [x] => represents current page
   * {...x} => represents page neighbours
   */
  fetchPageNumbers = () => {
    let { totalPages, currentPage, pageNeighbours } = this.state
    /**
     * totalNumbers: the total page numbers to show on the control
     * totalBlocks: totalNumbers + 2 to cover for the left(<) and right(>) controls
     */
    const totalNumbers = (pageNeighbours * 2) + 3
    const totalBlocks = totalNumbers + 2

    if (totalPages > totalBlocks) {

      const startPage = Math.max(2, currentPage - pageNeighbours)
      const endPage = Math.min(totalPages - 1, currentPage + pageNeighbours)

      let pages = range(startPage, endPage)

      /**
       * hasLeftSpill: has hidden pages to the left
       * hasRightSpill: has hidden pages to the right
       * spillOffset: number of hidden pages either to the left or to the right
       */
      const hasLeftSpill = startPage > 2
      const hasRightSpill = (totalPages - endPage) > 1
      const spillOffset = totalNumbers - (pages.length + 1)

      switch (true) {
        // handle: (1) < {5 6} [7] {8 9} (10)
        case (hasLeftSpill && !hasRightSpill): {
          const extraPages = range(startPage - spillOffset, startPage - 1)
          pages = [LEFT_PAGE, ...extraPages, ...pages]
          break
        }

        // handle: (1) {2 3} [4] {5 6} > (10)
        case (!hasLeftSpill && hasRightSpill): {
          const extraPages = range(endPage + 1, endPage + spillOffset)
          pages = [...pages, ...extraPages, RIGHT_PAGE]
          break
        }

        // handle: (1) < {4 5} [6] {7 8} > (10)
        case (hasLeftSpill && hasRightSpill):
        default: {
          pages = [LEFT_PAGE, ...pages, RIGHT_PAGE]
          break
        }
      }

      let ret = [1, ...pages, totalPages]
      return Array.from(new Set(ret))

    }

    return range(1, totalPages)

  }

  handleChangePage = currentPage => {
    let index = currentPage.indexOf('.')
    if (index >= 0) {
      currentPage = currentPage.substring(0, index)
    }
    if (currentPage.includes('-')) currentPage = ''
    this.setState({ tempPage: currentPage })
  }

  handlePageBlur = e => {
    this.gotoPage(e.target.value)
  }

  handlePressEnter = () => {
    this.gotoPage(this.state.tempPage)
  }

  handleChangeRowsPerPage = value => {
    this.setState({ currentPage: 1 }, () => this.props.onChangeRowsPerPage(value))
  }

  getPaginationBar = () => {
    let { classes } = this.props
    let { totalRecords, totalPages, currentPage, pageLimit } = this.state
    if (!totalRecords || (totalPages === 1 && totalRecords <= pageLimit)) {
      return (
        <ul className={classes.pagination}>
          <li key={'leftSymbol_1'} className={classes.pageLink}>
            {"<"}
          </li>
          <li
            key={'only_1'}
            className={classes.pageLink}
            style={{ background: 'rgba(137,142,255,1)', borderRadius: '4px' }}
          >
            1
            </li>
          <li key={'rightSymbol_1'} className={classes.pageLink}>
            {">"}
          </li>
        </ul>
      )
    } else {
      let pages = this.fetchPageNumbers()
      return (
        <ul className={classes.pagination}>

          <li key={'leftSymbol'} className={classes.pageLink} onClick={this.handleMoveLeft}>
            {"<"}
          </li>

          {pages.map((page, index) => {

            if (page === LEFT_PAGE) return (
              <li key={index} className={classes.pageLink} onClick={this.handleMoveLeft}>
                {'..'}
              </li>
            )

            if (page === RIGHT_PAGE) return (
              <li key={index} className={classes.pageLink} onClick={this.handleMoveRight}>
                {'..'}
              </li>
            )

            return (
              <li
                key={index}
                style={currentPage === page ? { background: 'rgba(137,142,255,1)', borderRadius: '4px' } : null}
                className={classes.pageLink}
                onClick={this.handleClick(page)}
              >
                {page}
              </li>
            )

          })}

          <li key={'rightSymbol'} className={classes.pageLink} onClick={this.handleMoveRight}>
            {">"}
          </li>

        </ul>
      )
    }
  }

  render() {
    let { classes } = this.props
    let paginationBar = this.getPaginationBar()

    return (
      <div className={classes.wrapper}>
        <div className={classes.pageLeft}>
          {paginationBar}
          <TextField
            type='number'
            className={classes.customTextField}
            value={this.state.tempPage}
            onChange={e => this.handleChangePage(e.target.value)}
            onBlur={this.handlePageBlur}
            onPressEnter={this.handlePressEnter}
          />
        </div>

        <div className={classes.pageRight}>
          <div className={classes.resultPerPage}>
            RESULTS PER PAGE
          </div>
          <Select
            value={this.props.rowsPerPage}
            options={this.props.rowsPerPageOptions}
            onChange={value => this.handleChangeRowsPerPage(value)}
          />
        </div>
      </div>
    )
  }
}

Pagination.propTypes = {
  totalRecords: PropTypes.number,
  pageLimit: PropTypes.number,
  pageNeighbours: PropTypes.number,
  onPageChanged: PropTypes.func
}

export default withStyles(styles)(Pagination)
