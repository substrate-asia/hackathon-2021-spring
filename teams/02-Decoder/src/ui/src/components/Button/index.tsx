import React, { FC } from 'react';
import { Button as AButton } from 'antd';
import { ButtonProps as AButtonProps } from 'antd/lib/button/button'
import styled from 'styled-components';



interface ButtonProps extends AButtonProps {
  btnTypes?: string;
}
const AButtonBox = styled(AButton)`

&.ant-btn{
  background:white;
  &:hover{
    color: var(--primary-color-light);
    border-color:var(--primary-color-light);
  }
  &:focus{
    color: var(--primary-color-light);
    border-color:var(--primary-color-light);
  }
  &:active{
    color: var(--primary-color-dark);
    border-color:var(--primary-color-dark);
  }
}
&.ant-btn-primary{

  color: white;
  background: var(--primary-color);
  border-color:var(--primary-color);
  &:hover{
    color: white;
    background: var(--primary-color-light);
    border-color:var(--primary-color-light);
  }
  &:focus{
    color: white;
    background: var(--primary-color-light);
    border-color:var(--primary-color-light);
  }
  &:active{
    color: white;
    background: var(--primary-color-dark);
    border-color:var(--primary-color-dark);
  }
}
`;
export const Button: FC<ButtonProps> = ({
  icon,
  loading,
  prefixCls,
  className,
  ghost,
  danger,
  block,
  children,
  size,
  type,
  shape,
  onClick,
  disabled,
  btnTypes,
  ...other
}) => {
  return (
    <AButtonBox
      disabled={disabled}
      icon={icon}
      loading={loading}
      prefixCls={prefixCls}
      className={className}
      ghost={ghost}
      danger={danger}
      block={block}
      size={size}
      type={type}
      shape={shape}
      onClick={onClick}
    >
      {children}
    </AButtonBox>
  )
}