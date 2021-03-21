import React, { useState, useCallback, useEffect } from 'react';

import Identicon from '@polkadot/react-identicon';
import { Modal } from '@/components/Modal';
import styled from 'styled-components';

import { ReactComponent as CheckedIcon } from '../../assets/checked.svg';
import { InjectedAccount } from '@polkadot/extension-inject/types';
import { useTranslation } from '@/components';

const AccountList = styled.ul`
  max-height: 500px;
  list-style: none;
  border-radius: 2px;
  border: 1px solid #ecf0f2;
  overflow: auto;
`;

const AccountItem = styled.li`
  position: relative;
  display: flex;
  font-size: 16px;
  line-height: 19px;
  padding: 14px 16px;
  cursor: pointer;
  transition: background 200ms cubic-bezier(0.0, 0, 0.2, 1) 0ms;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    right: 0;
    height: 1px;
    width: calc(100% - 50px);
    background: #ecf0f2;
  }

  &:hover {
    background: #f2f5f7;
  }

  &:last-child::after {
    display: none;
  }

  .account__item__icon {
    margin-right: 16px;
  }

  .account__item__account {
    flex: 1;
  }

  .account__item__checked {
    width: 16px;
  }
`;

interface Props {
  defaultAccount?: string;
  accounts: InjectedAccount[];
  visible: boolean;
  onSelect?: (account: InjectedAccount) => void;
  onCancel: () => void;
}

export const SelectAccount: React.FC<Props> = ({
  accounts,
  defaultAccount,
  onCancel,
  onSelect,
  visible
}) => {
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const {t} = useTranslation();

  const confirmHandler = useCallback(() => {
    console.log('tt');
    
    onSelect && onSelect(accounts[selectedIndex]);
  }, [onSelect, accounts, selectedIndex]);

  useEffect(() => {
    if (!defaultAccount || !accounts.length) return;

    const defaultIndex = accounts.findIndex((item) => item.address === defaultAccount);

    setSelectedIndex(defaultIndex);
  }, [defaultAccount, accounts, setSelectedIndex]);

  return (
    <Modal
      onCancel={onCancel}
      onOk={confirmHandler}      
      title={t('Choose Account')}
      visible={visible}
    >
      <AccountList>
        {
          accounts.map((item, index) => {
            return (
              <AccountItem
                key={`account-${item.address}`}
                onClick={(): void => setSelectedIndex(index)}
              >
                <Identicon
                  className='account__item__icon'
                  size={16}
                  theme='polkadot'
                  value={item.address}
                />
                <p className='account__item__account'>{item.name}</p>
                <div className='account__item__checked'>
                  {
                    selectedIndex === index ? <CheckedIcon /> : null
                  }
                </div>
              </AccountItem>
            );
          })
        }
      </AccountList>
    </Modal>
  );
};
