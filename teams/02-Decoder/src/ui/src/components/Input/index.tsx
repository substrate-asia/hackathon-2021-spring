import React, { useCallback, useState } from 'react';
import { Input as AInput } from 'antd';
import styled from 'styled-components';
import { useTranslation } from '@/components';

const InputBox = styled.div`
  position:relative;
  border-radius:var(--sm-radius);
  border:1px solid var(--border-color);
  padding:5px;
`;

const ButtonBox = styled.button`
  position:absolute;
  right:10px;
  bottom:9px;
  z-index:1;
  border:none;
  outline:none;
  background: var(--primary-color);
  color:white;
  font-weight:bold;
  text-align:center;
  border-radius: var(--sm-radius);
  &:hover{
    background: var(--primary-color-light);
    border-color:var(--primary-color-light);
  }
  &:focus{
    background: var(--primary-color-light);
    border-color:var(--primary-color-light);
  }
  &:active{
    background: var(--primary-color-dark);
    border-color:var(--primary-color-dark);
  }
`;
interface MaxBtnProps {
  onClick: () => void;
}
const MaxBtn: React.FC<MaxBtnProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <ButtonBox onClick={onClick}>{t('All')}</ButtonBox>
  )
}
interface Props {
  balance?: number;
  showAll?: boolean;
}

const AInputBox = styled(AInput)`
  min-width: 300px;
  font-size: 16px;
`;

export const Input: React.FC<Props> = ({
  balance,
  showAll = true
}) => {
  const [val, setVal] = useState<number | null>(null);

  const handleMaxBalance = useCallback(() => {
    if (!balance) {
      return
    }
    setVal(balance)
  }, [setVal, balance])

  return (
    <InputBox>
      <AInputBox
        bordered={false}
        value={val}
        type="number"
        placeholder="0.0"
        onChange={(e: { currentTarget: { value: unknown; }; }) => setVal(e.currentTarget.value as unknown as number)}
      />
      {showAll ? (
        <MaxBtn onClick={handleMaxBalance} />
      ) : null}
      
    </InputBox>
  )
}