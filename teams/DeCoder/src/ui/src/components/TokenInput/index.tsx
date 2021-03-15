import React, { FC } from 'react';
import { AntInput, AntInputProps } from '@/components/AntInput';
import { styled } from '@/components';
import { useTranslation } from '@/components';
import classes from './index.module.scss'

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
  onClick?: () => void;
}
const MaxBtn: React.FC<MaxBtnProps> = ({ onClick }) => {
  const { t } = useTranslation();

  return (
    <ButtonBox onClick={onClick}>{t('All')}</ButtonBox>
  )
}
interface Props extends AntInputProps {
  showAll?: boolean;
  onAll?: () => void;
  onChange?: (value: any) => void;
  validate?: string;
}

const AInputBox = styled(AntInput)`
  min-width: 300px;
  font-size: 16px;
`;

const ValidateMsg = styled.div`
  position:absolute;
  width:100%;
  height:32px;
  text-align:center;
  color: var(--warning-color);
  bottom:-36px;
  left: 0;
`;

export const TokenInput: FC<Props> = ({
  onChange,
  showAll,
  value,
  onAll,
  validate
}) => {

  const {t} = useTranslation();

  return (
    <InputBox
      className={
        validate  ? classes.error : ''
      }
    >
      <AInputBox

        bordered={false}
        value={value}
        onChange={onChange}
        placeholder="0.0"
        type="number"
      />
      {showAll ? (
        <MaxBtn onClick={onAll} />
      ) : null}
      {
        validate ? (
          <ValidateMsg>{t(validate)}</ValidateMsg>
        ) : null
      }
    </InputBox>
  )
}