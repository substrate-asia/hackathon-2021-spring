import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Identicon from '@polkadot/react-identicon';
import { useAccounts } from '@hooks';
import { FormatAddress } from '@/utils';
import { ReactComponent as CheckedIcon } from '../../assets/checked.svg';

const AccountBarBox = styled.div`
    background:var(--light-bg);
    color:var(--normal-color);
    border-radius:27px;
    display:flex;
    align-item:center;
    padding:15px 20px;
    cursor:pointer;
    span{
        margin-left: 10px;
    }
`;
const Box = styled.div`
  position:relative;
`;

const ListBox = styled.ul<{ visible: boolean }>`
    position:absolute;
    width:240px;
    background:white;
    right:0;
    top:42px;
    border:1px solid var(--border-color);
    border-radius:var(--lg-radius);
    box-shadow: 0px 7px 7px 0px rgba(0, 0, 0, 0.1);
    overflow:hidden;
    z-index:1;
    display:${(props: { visible: boolean; }) => (props.visible ? 'block' : 'none')};
    li{
      display:flex;
      align-items:center;
      padding:10px 20px;
      cursor:pointer;
      &:hover{
        background:var(--light-bg);
      }
      span{
        margin-left:10px;
      }
      .checkedIcon{
        margin-left:30px;
      }
    }
`;

export const AccountSelect: FC = () => {
  const { active, accounts, setCurrentAccount } = useAccounts();
  const [visible, setVisible] = useState<boolean>(false);
  const accountBtn = useRef<any>();

  const handleAccountClick = useCallback((address: string) => {
    setCurrentAccount(address)
    setVisible(false);
  }, [setCurrentAccount])

  useEffect(()=>{
    document.addEventListener("click", ()=>{
      setVisible(false)      
    }, false);
    return ()=>{
      document.removeEventListener("click",()=>{},false)
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }
  },[setVisible,accountBtn])

  const handleShowSelect = useCallback((e) => {
    e.stopPropagation()
    setVisible(!visible)
  }, [visible])

  return (
    <Box ref={accountBtn} onClick={handleShowSelect}>
      <AccountBarBox>
        <Identicon
          size={20}
          theme="polkadot"
          value={(active?.address)}
        />
        <span>
          {FormatAddress(active?.address)}
        </span>
      </AccountBarBox>
      <ListBox visible={visible}>
        {
          accounts?.map((item) => (
            <li
              key={`account-${item.address}`}
              onClick={() => handleAccountClick(item.address)}
            >
              <Identicon
                size={20}
                theme="polkadot"
                value={(item.address)}
              />
              <span>{FormatAddress(item.address)}</span>
              {/* {active?.address}
              <br/>
              {item.address} */}
              {
                active?.address === item.address ? (
                  
                  <CheckedIcon className="checkedIcon" />
                ) : null
              }
            </li>
          ))
        }
      </ListBox>
    </Box>
  )
}