import React, { useState, useEffect } from 'react'
import Dropdown from './Dropdown'
import Icon from './Icon'
import './Filter.scss'

export default function Filter(props) {
  const [filterNum, setFilterNum] = useState(0)
  const [showFilterDetail, setShowFilterDetail] = useState(false)

  const initStatus = { id: 0, name: 'All', key: '' }

  const [companyOption, setCompanyOption] = useState(initStatus)
  const [assetOption, setAssetOption] = useState(initStatus)
  const [walletOption, setWalletOption] = useState(initStatus)
  const [dateOption, setDateOption] = useState(initStatus)

  const [companyOptions, setCompanyOptions] = useState([])
  const [assetOptions, setAssetOptions] = useState([])
  const [walletOptions, setWalletOptions] = useState([])
  const [dateOptions, setDateOptions] = useState([])

  let className = ['custom-filter-common']
  if (props.className) className.push(props.className)
  if (props.row) {
    className.push('flex-row')
  } else {
    className.push('flex-column')
  }

  const checkValidOption = obj => {
    return obj && Object.keys(obj).length > 0 && obj.name !== 'All'
  }

  const handleClick = () => {
    setShowFilterDetail(false)
  }

  useEffect(() => {
    // Bind the event listener
    window.addEventListener('click', handleClick)
    return () => {
      // Unbind the event listener on clean up
      window.removeEventListener('click', handleClick)
    }
  }, [])

  useEffect(() => {
    setAssetOptions(props.assetOptions)
    setCompanyOptions(props.companyOptions)
    setWalletOptions(props.walletOptions)
    setDateOptions(props.dateOptions)
  }, [props.assetOptions, props.companyOptions, props.walletOptions, props.dateOptions])

  const wrapFilter = () => {
    return {
      company: companyOption,
      asset: assetOption,
      wallet: walletOption,
      date: dateOption
    }
  }

  const handleClickFilterBtn = e => {
    e.stopPropagation()
    setShowFilterDetail(!showFilterDetail)
    if (showFilterDetail) {
      setShowFilterDetail(false)
      let cnt = 0
      if (checkValidOption(companyOption)) cnt += 1
      if (checkValidOption(assetOption)) cnt += 1
      if (checkValidOption(walletOption)) cnt += 1
      if (checkValidOption(dateOption)) cnt += 1
      setFilterNum(cnt)
      let filterObj = wrapFilter()
      props.onFilter(filterObj)
    } else {
      setShowFilterDetail(true)
    }
  }

  const handleChange = (key, obj) => {
    switch (key) {
      case 'company':
        setCompanyOption(obj)
        break
      case 'asset':
        setAssetOption(obj)
        break
      case 'wallet':
        setWalletOption(obj)
        break
      case 'date':
        setDateOption(obj)
        break
      default:
        break
    }
  }

  return (
    <div className={className.join(' ')} style={props.style}>
      <div row style={filterNum === 0 ? { background: 'white' } : { background: 'rgba(244,245,250,1)' }} className='custom-filter-button' onClick={e => handleClickFilterBtn(e)}>
        {
          filterNum === 0
            ?
            <React.Fragment>
              <Icon name='filter' small />&nbsp;
              Filter
            </React.Fragment>
            :
            <React.Fragment>
              <div className='custom-filter-num'>
                <div style={{ marginLeft: '-1px' }}>{filterNum}</div>
              </div>&nbsp;
              Filters
            </React.Fragment>
        }

      </div>
      {
        showFilterDetail ?
          <div className='custom-filter-panel' onClick={e => e.stopPropagation()}>
            <div style={{ margin: '16px' }}>
              <div>
                <div className='custom-filter-name'>Company</div>
                <Dropdown option={companyOption} options={companyOptions} onChange={obj => handleChange('company', obj)} />
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className='custom-filter-name'>Wallet</div>
                <Dropdown option={walletOption} options={walletOptions} onChange={obj => handleChange('wallet', obj)} />
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className='custom-filter-name'>Coin</div>
                <Dropdown option={assetOption} options={assetOptions} onChange={obj => handleChange('asset', obj)} />
              </div>

              <div style={{ marginTop: '16px' }}>
                <div className='custom-filter-name'>Time</div>
                <Dropdown option={dateOption} options={dateOptions} onChange={obj => handleChange('date', obj)} />
              </div>

            </div>
          </div>
          :
          null
      }
    </div>
  )
}
