import React, { FC, ReactElement } from 'react';
import Box from '@material-ui/core/Box';
import { Tx } from '../../core';
import SuccessSvg from '../../assets/success.svg';
import FailSvg from '../../assets/fail.svg';
import LinkSvg from '../../assets/link.svg';

export const TxInfo: FC<{tx: Tx}> = ({ tx }): ReactElement => {
  return (
    <div className="tx-info">
      <h3 style={{ textAlign: 'left', color: 'white', height: '3.5rem', lineHeight: '3.5rem', padding: '0rem 2.2rem', borderRadius: '1.5rem 1.5rem 0rem 0rem', background: tx.status ? '#20CB97' : '#E55151'}}>
        {
          tx.status ?
            <img style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} src={SuccessSvg} alt=""/>
            :
            <img style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} src={FailSvg} alt=""/> 
        }
        <span style={{ verticalAlign: 'middle' }}>
          { tx.status ? '验证成功' : '验证失败' }
        </span>
      </h3>
      <Box height="3rem" lineHeight="3rem" padding="0rem 2.2rem" display="flex" justifyContent="space-between">
        <span style={{ fontWeight: 600 }}>Tx Hash:</span>
        <a className="tx-link" href={`https://www.blockchain.com/btc/tx/${tx.tx_hash.slice(2)}`} target="blank">
          <img style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} src={LinkSvg} alt=""/>
          <span style={{ verticalAlign: 'middle' }} >{ tx.tx_hash.slice(0, 7) }</span>
        </a>
      </Box>
      <div style={{height: '3rem', lineHeight: '3rem', padding: "0rem 2.2rem", display: "flex", justifyContent: "space-between" }}>
        <span style={{ fontWeight: 600 }}>Requirer:</span>
        <span>{ tx.requester.slice(0, 7) }</span>
      </div>
    </div>
  )
};