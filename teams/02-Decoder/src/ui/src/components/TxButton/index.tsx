import React, { FC } from 'react';
import { BaseProps } from '../types';
import { Button } from '@/components/Button';
import styled from 'styled-components';

const ButtonBox = styled(Button)`
  border-radius: 4px;
  width: 320px;
  height: 56px;
  background: var(--primary-color);
  border-color:var(--primary-color);

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

interface TxButtonProps extends BaseProps {
  loading?: boolean;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  type?: 'primary' | 'ghost' | 'dashed' | 'link' | 'text' | 'default';
  size?: 'small' | 'middle' | 'large';
}

export const TxButton: FC<TxButtonProps> = ({
  children,
  ...other
}) => {
  return (
    <ButtonBox
      size='large'
      {...other}
    >
      {children}
    </ButtonBox>
  )
}