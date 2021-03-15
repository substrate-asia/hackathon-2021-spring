import { Box } from '@material-ui/core';
import React, { FC, ReactElement } from 'react';
import { Block, Tx } from '../../core';
import { TxInfo } from './tx-info';
import './block-info.css';
import { Progress } from './progress';

interface IProps {
  blockData: Block;
  txs: Tx[],
  checked?: boolean;
  first?: boolean;
}

export const BlockInfo: FC<IProps> = ({
  blockData,
  txs,
  checked = false,
  first = false,
}): ReactElement => {

  return (
    <div className="block-info">
      <Box height="4rem" bgcolor="rgb(239, 239, 239)" position="relative" left="-2.2rem">
        {
          checked && !first &&
            <Progress width={292}></Progress>
        }
      </Box>
      <Box width="37rem" height="20rem" bgcolor="white" boxShadow='0px 0px 24px 0px rgba(0,0,0,0.08)'>
        <Box color="white" textAlign="left" height="5rem" lineHeight="5rem" paddingLeft="2.2rem" bgcolor="#E5AA64" position="relative">
          <span>
            <span style={{ fontWeight: 700 }}>Relayer:&nbsp;&nbsp;</span>
            { blockData.relayer.slice(0, 7) }
          </span>
          <a href={`https://www.blockchain.com/btc/block/${blockData.hash.slice(2)}`} target="blank">
            <div className="block-number">
              <div style={{ fontSize: '2.4rem', position: 'relative', top: '1rem' }}>
                { blockData.height }
              </div>
              <span>block</span>
            </div>
          </a>
        </Box>
        
        <Box>
          <Box height="5rem" lineHeight="5rem" padding="0rem 2.2rem" display="flex" justifyContent="space-between">
            <span style={{ fontWeight: 600 }}>producer</span>
            <span>{ blockData.miner.slice(0, 7) }</span>
          </Box>
          <Box height="5rem" lineHeight="5rem" padding="0rem 2.2rem" display="flex" justifyContent="space-between">
            <span style={{ fontWeight: 600 }}>nonce</span>
            <span>{ blockData.nonce }</span>
          </Box>
          <Box height="5rem" lineHeight="5rem" padding="0rem 2.2rem" display="flex" justifyContent="space-between">
            <span style={{ fontWeight: 600 }}>difficulty</span>
            <span>{ blockData.difficulty }</span>
          </Box>
        </Box>
      </Box>
      {
        !!txs.length &&
          <Box width="37rem" marginTop="1rem" bgcolor="white" padding="1.8rem" boxShadow='0px 0px 24px 0px rgba(0,0,0,0.08)'>
            {
              txs.map(tx => <TxInfo key={tx.tx_hash} tx={tx}></TxInfo>)
            }
          </Box>
      }
    </div>
  );
};