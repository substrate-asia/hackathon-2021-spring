import React, { FC } from 'react';
import styled from 'styled-components';
import Identicon from '@polkadot/react-identicon';
import { useAccounts } from '@hooks';
import { FormatAddress } from '@/utils';

const AccountBarBox = styled.div`
    background:white;
    color:var(--normal-color);
    border:1px solid var(--border-color);
    border-radius:17px;
    display:flex;
    align-item:center;
    padding:5px 10px;
    cursor:pointer;

    span{
        margin-left: 10px;
    }
`;
export const AccountBar: FC = () => {
  const {active,setSelectAccountStatus} = useAccounts();

  return (
    <AccountBarBox onClick={() => setSelectAccountStatus(true)}>
        <Identicon
          size={20}
          value={(active?.address)}
          theme="polkadot"
        />
        <span>
          {FormatAddress(active?.address)}
        </span>
    </AccountBarBox>
  )
}