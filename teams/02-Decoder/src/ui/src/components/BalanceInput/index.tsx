import React, { FC } from 'react';
import { AntInput, AntInputProps, styled } from '@/components'

export interface BalanceInputProps extends AntInputProps {
  error?: string;
}
const BalanceInputBox = styled.div`
  position:relative;
  &.error {
    input{ 
      border-color:var(--dark-red); 
    }
  }
`;

const AntInputbox = styled(AntInput)<{error:string}>`
  width:320px;
  padding:16px;
  border-radius:20px;
  height:40px;
  margin-left:20px;
  margin-right:20px;
`;

const ValidTipsBox = styled.div`
  position:absolute;
  bottom:-25px;
  left:20px;
  z-index:1;
  text-align:center;
  width:320px;
  color:var(--dark-red);
`;
interface ValidTipsProps {
  msg: string | undefined;
}
const ValidTips: FC<ValidTipsProps> = ({ msg }) => {
  return (
    <ValidTipsBox>
      {msg}
    </ValidTipsBox>
  )
}
export const BalanceInput: FC<BalanceInputProps> = ({
  error,
  ...props
}) => {
  
  return (
    <BalanceInputBox className={!!error ? 'error' : ''}>
      <AntInputbox
        {...props}
      />
      {
        error !== '' ? (
          <ValidTips msg={error} />
        ) : null
      }
    </BalanceInputBox>
  )
}